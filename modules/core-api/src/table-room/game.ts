import { applySettings, MatchRecord, publicEvents, roundPoints, settingChanges, turnClockMs, type MatchSeatHolder, type Move, type RoundEvent, type RoundPeek } from '@wild-table/engine';
import { defaultGameSettings, gameLimits, type GamePhase, type GameSettings, type GameSettingsPatch, type PlayEvent } from '@wild-table/protocol';
import { limits } from '../limits.js';
import type { TableRoomCards } from './cards.js';
import type { TableRoomClock } from './clock.js';
import { TableRoomError } from './error.js';
import type { TableRoomFeed } from './feed.js';
import type { TableRoomMembers } from './members.js';

export interface TableRoomGameDeps {
  members: TableRoomMembers;
  feed: TableRoomFeed;
  cards: TableRoomCards;
  clock: TableRoomClock;
  now: () => number;
  // Something changed on the clock, with nobody asking: everyone needs to hear about it.
  changed: () => void;
}

const { roundOverMs } = limits.table;

// The game's states (spec §10.3): lobby → round → roundOver → round … → podium → lobby, the
// settings, the match, and the clock. Moves go to the cards; what happened is kept for the
// outbox, split into what everyone sees and what's private.
export class TableRoomGame {
  phase: GamePhase = 'lobby';
  settings: GameSettings = { ...defaultGameSettings };
  readonly match = new MatchRecord();
  #played: PlayEvent[] = [];
  #peeks: RoundPeek[] = [];
  readonly #deps: TableRoomGameDeps;

  constructor(deps: TableRoomGameDeps) {
    this.#deps = deps;
  }

  // Anyone may change the settings in the lobby (spec D15); each change gets a feed line.
  updateSettings(memberId: string, patch: GameSettingsPatch): void {
    const author = this.#deps.members.get(memberId);

    this.#expect('lobby');

    const next = applySettings(this.settings, patch);

    settingChanges(this.settings, next).forEach((change) => this.#deps.feed.system(author, change));
    this.settings = next;
  }

  // Anyone deals the first round, once two seats are filled (spec §4.2).
  start(memberId: string): void {
    const author = this.#deps.members.get(memberId);

    this.#expect('lobby');

    if (this.#deps.members.count < gameLimits.minPlayers) throw new TableRoomError('NOT_ENOUGH_PLAYERS');

    this.match.begin();
    this.#deps.feed.system(author, { type: 'matchStarted' });
    this.#deal();
  }

  // A person's own move: if a bot was playing for them, they're back.
  move(memberId: string, move: Move, strength: number): void {
    this.#move(memberId, move, strength);
    this.match.acted(memberId);
  }

  // A bot's move, for a bot's seat or one it's standing in for.
  botMove(seat: string, move: Move): void {
    this.#move(seat, move, 0.5);
  }

  // Skips the wait after a round.
  nextRound(memberId: string): void {
    this.#deps.members.get(memberId);
    this.#expect('roundOver');
    this.#deal();
  }

  // After the podium, back to the lobby with everyone still here (spec §4.4).
  playAgain(memberId: string): void {
    this.#deps.members.get(memberId);
    this.#expect('podium');
    this.phase = 'lobby';
    this.#deps.clock.stop();
    this.#deps.cards.clear();
    this.match.begin();
  }

  // Someone left for good mid-match: a bot plays their seat for the rest of the round (§4.5).
  leave(memberId: string): void {
    this.match.dropOut(memberId);
  }

  // What happened since the last call: for everyone, and privately.
  drainPlayed(): PlayEvent[] {
    const played = this.#played;

    this.#played = [];

    return played;
  }

  drainPeeks(): RoundPeek[] {
    const peeks = this.#peeks;

    this.#peeks = [];

    return peeks;
  }

  dispose(): void {
    this.#deps.clock.stop();
  }

  #expect(phase: GamePhase): void {
    if (this.phase !== phase) throw new TableRoomError('WRONG_PHASE');
  }

  #move(seat: string, move: Move, strength: number): void {
    this.#expect('round');

    if (!this.match.isSeated(seat)) throw new TableRoomError('NOT_PLAYING');

    const events = this.#deps.cards.move(seat, move);

    this.#record(events, strength);
    this.#afterMove(events);
  }

  #record(events: readonly RoundEvent[], strength: number): void {
    const { played, peeks } = publicEvents(events, strength, this.settings.handSize);

    this.#played = [...this.#played, ...played];
    this.#peeks = [...this.#peeks, ...peeks];
  }

  // Everyone at the table now gets a seat: people (reconnecting ones too) and bots, at most six;
  // the newest bots make way for newcomers (spec §4.3, D14).
  #seatHolders(): MatchSeatHolder[] {
    const all = this.#deps.members.all.map(({ id, name, color, bot }) => ({ id, name, color, bot }));

    while (all.length > gameLimits.maxPlayers) {
      const bot = all.findLastIndex((member) => member.bot);

      all.splice(bot >= 0 ? bot : all.length - 1, 1);
    }

    return all.map(({ id, name, color }) => ({ id, name, color }));
  }

  // The next round, or back to the lobby when fewer than two are left to play it.
  #deal(): void {
    const holders = this.#seatHolders();

    if (holders.length < gameLimits.minPlayers) {
      this.phase = 'lobby';
      this.#deps.clock.stop();
      this.#deps.cards.clear();

      return;
    }

    this.match.nextRound(holders);
    this.#record(this.#deps.cards.deal(this.match.seats, this.settings, this.match.lastWinner), 0);
    this.phase = 'round';
    this.#startTurn();
  }

  // The first turn's fuse (spec D11).
  #startTurn(): void {
    this.#deps.clock.start(this.settings.turnSeconds * 1000, () => this.#timeout());
  }

  // The clock after a move: a new turn gets the whole time, a new step in the same turn what's left
  // (at least a few seconds).
  #afterMove(events: readonly RoundEvent[]): void {
    const { cards, clock, now } = this.#deps;

    if (cards.winner !== null) {
      this.#endRound();

      return;
    }

    const ms = turnClockMs(events, { turnMs: this.settings.turnSeconds * 1000, leftMs: (clock.endsAt ?? 0) - now() });

    clock.start(ms, () => this.#timeout());
  }

  #timeout(): void {
    const turn = this.#deps.cards.round?.turn;

    if (this.phase !== 'round' || !turn) return;

    const step = this.#deps.cards.round?.step.kind ?? 'play';

    this.#played = [...this.#played, { type: 'timedOut', seat: turn, step }];

    const events = this.#deps.cards.timeout();

    this.#record(events, 0);
    this.match.timedOut(turn);
    this.#afterMove(events);
    this.#deps.changed();
  }

  #endRound(): void {
    const { cards, clock, feed, members } = this.#deps;
    const round = cards.round;
    const winner = round?.winner;

    if (!round || !winner) return;

    const points = roundPoints(round, winner);
    const isMatchOver = this.match.win(winner, points, { ...round.hands }, this.settings.targetScore);
    const author = members.find(winner);

    if (author) feed.system(author, isMatchOver ? { type: 'matchWon', score: this.match.scores.get(winner) ?? 0 } : { type: 'roundWon', points });

    this.phase = isMatchOver ? 'podium' : 'roundOver';

    if (isMatchOver) clock.stop();
    else
      clock.start(roundOverMs, () => {
        this.#deal();
        this.#deps.changed();
      });
  }
}
