import { applySettings, MatchRecord, publicEvents, roundPoints, settingChanges, type MatchSeatHolder, type Move, type RoundEvent, type RoundPeek } from '@wild-table/engine';
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

const { roundOverMs, raceBeatMs } = limits.table;

// The game's states (spec §10.3): lobby → round → roundOver → round … → podium → lobby, the
// settings, the match, and the clock. Moves go to the cards; what happened is kept for the
// outbox, split into what everyone sees and what's private.
export class TableRoomGame {
  phase: GamePhase = 'lobby';
  settings: GameSettings = { ...defaultGameSettings };
  readonly match = new MatchRecord();
  // Until then the next player waits, after a Last card! race opens (spec §5.6).
  beatUntil = 0;
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
    const { cards, now } = this.#deps;
    const racing = cards.round?.race ?? null;

    this.#expect('round');

    if (!this.match.isSeated(seat)) throw new TableRoomError('NOT_PLAYING');

    if ((move.type === 'play' || move.type === 'draw') && seat === cards.round?.turn && now() < this.beatUntil) throw new TableRoomError('TOO_SOON');

    this.#record(cards.move(seat, move), strength);

    const race = cards.round?.race ?? null;

    if (race !== null && race !== racing) this.beatUntil = now() + raceBeatMs;

    this.#afterMove(move.type === 'bell');
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
    this.beatUntil = 0;
    this.#startTurn(0);
  }

  // The turn's fuse (spec D11), plus the beat when a race just opened.
  #startTurn(extraMs: number): void {
    this.#deps.clock.start(this.settings.turnSeconds * 1000 + extraMs, () => this.#timeout());
  }

  #afterMove(wasBell: boolean): void {
    if (this.#deps.cards.winner !== null) {
      this.#endRound();

      return;
    }

    if (!wasBell) this.#startTurn(Math.max(0, this.beatUntil - this.#deps.now()));
  }

  #timeout(): void {
    const turn = this.#deps.cards.round?.turn;

    if (this.phase !== 'round' || !turn) return;

    this.#played = [...this.#played, { type: 'timedOut', seat: turn }];
    this.#record(this.#deps.cards.timeout(), 0);
    this.match.timedOut(turn);
    this.#afterMove(false);
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
