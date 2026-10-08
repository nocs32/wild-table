import {
  applyMove,
  applyTimeout,
  dealRound,
  handOf,
  MatchRecord,
  nextFirstSeat,
  publicEvents,
  roundPoints,
  roundSnapshot,
  type Move,
  type MoveResult,
  type RoundEvent,
  type RoundPeek,
  type RoundState,
} from '@wild-table/engine';
import { gameLimits, type FeedEvent, type GamePhase, type GameSettings, type HandSnapshot, type MatchSnapshot, type PlayEvent, type TableErrorCode } from '@wild-table/protocol';
import { DemoPlans } from './plans';
import type { DemoDeps, DemoMember } from './types';

// The server's pace (core-api `limits.ts`): the scores show for 10 seconds after a round, and the
// next player waits a beat after a Last card! race opens (spec §4.3, §5.6).
export const demoPace = { roundOverMs: 10_000, raceBeatMs: 1500 };

export interface DemoMatchHost {
  members: () => readonly DemoMember[];
  settings: () => GameSettings;
  system: (memberId: string, event: FeedEvent) => void;
  // Something changed on the clock, with nobody asking: everyone needs to hear about it.
  changed: () => void;
}

export interface DemoDrained {
  played: PlayEvent[];
  peeks: RoundPeek[];
}

// The match at the demo table, as the server plays it (core-api `game.ts`, spec §10.3): lobby →
// round → roundOver → round … → podium → lobby, with the engine's rules, the turn clock, and the
// engine's MatchRecord keeping score.
export class DemoMatch {
  phase: GamePhase = 'lobby';
  round: RoundState | null = null;
  readonly record = new MatchRecord();
  // When the turn runs out, or the next round is dealt.
  endsAt = 0;
  beatUntil = 0;
  #played: PlayEvent[] = [];
  #peeks: RoundPeek[] = [];
  readonly #deps: DemoDeps;
  readonly #host: DemoMatchHost;
  readonly #plans: DemoPlans<'clock'>;

  constructor(deps: DemoDeps, host: DemoMatchHost) {
    this.#deps = deps;
    this.#host = host;
    this.#plans = new DemoPlans(deps.schedule);
  }

  start(memberId: string): TableErrorCode | null {
    if (this.phase !== 'lobby') return 'WRONG_PHASE';

    if (this.#host.members().length < gameLimits.minPlayers) return 'NOT_ENOUGH_PLAYERS';

    this.record.begin();
    this.#host.system(memberId, { type: 'matchStarted' });
    this.#deal();

    return null;
  }

  // A move, by a person (`person`: they're back if a bot was playing for them) or a bot.
  move(seat: string, move: Move, strength: number, person: boolean): TableErrorCode | null {
    const round = this.round;

    if (this.phase !== 'round' || !round) return 'WRONG_PHASE';

    if (!this.record.isSeated(seat)) return 'NOT_PLAYING';

    if ((move.type === 'play' || move.type === 'draw') && seat === round.turn && this.#deps.now() < this.beatUntil) return 'TOO_SOON';

    const error = this.#apply(applyMove(round, seat, move, this.#deps.random), strength, move.type === 'bell');

    if (error === null && person) this.record.acted(seat);

    return error;
  }

  nextRound(): void {
    if (this.phase === 'roundOver') this.#deal();
  }

  playAgain(): void {
    if (this.phase !== 'podium') return;

    this.#toLobby();
    this.record.begin();
  }

  leave(memberId: string): void {
    this.record.dropOut(memberId);
  }

  drain(): DemoDrained {
    const drained = { played: this.#played, peeks: this.#peeks };

    this.#played = [];
    this.#peeks = [];

    return drained;
  }

  snapshot(): MatchSnapshot | null {
    if (this.phase === 'lobby') return null;

    const { record, round } = this;

    return {
      number: record.number,
      seats: record.seats.map((id) => {
        const holder = this.#host.members().find((member) => member.id === id) ?? record.holders.get(id);

        return { id, name: holder?.name ?? '', color: holder?.color ?? 'teal', cards: round ? handOf(round, id).length : 0, score: record.scores.get(id) ?? 0, standIn: record.standIns.has(id) };
      }),
      round: this.phase === 'round' && round ? roundSnapshot(round, this.endsAt) : null,
      result: record.result,
      nextAt: this.phase === 'roundOver' ? this.endsAt : null,
      champion: record.champion,
    };
  }

  hand(seat: string): HandSnapshot | null {
    const round = this.round;

    if (this.phase !== 'round' || !round || !round.seats.includes(seat)) return null;

    return { cards: [...handOf(round, seat)], drawnCardId: round.turn === seat && round.step.kind === 'drawn' ? round.step.cardId : null };
  }

  dispose(): void {
    this.#plans.cancelAll();
  }

  #apply(result: MoveResult, strength: number, wasBell: boolean): TableErrorCode | null {
    if (!result.ok) return result.error === 'ROUND_OVER' ? 'WRONG_PHASE' : result.error;

    const racing = this.round?.race ?? null;

    this.round = result.state;
    this.#record(result.events, strength);

    if (result.state.race !== null && result.state.race !== racing) this.beatUntil = this.#deps.now() + demoPace.raceBeatMs;

    this.#afterMove(wasBell);

    return null;
  }

  #record(events: readonly RoundEvent[], strength: number): void {
    const { played, peeks } = publicEvents(events, strength, this.#host.settings().handSize);

    this.#played = [...this.#played, ...played];
    this.#peeks = [...this.#peeks, ...peeks];
  }

  // Everyone at the table gets a seat, up to six; with fewer than two, back to the lobby.
  #deal(): void {
    const holders = this.#host.members().slice(0, gameLimits.maxPlayers).map(({ id, name, color }) => ({ id, name, color }));
    const settings = this.#host.settings();
    const random = this.#deps.random;

    if (holders.length < gameLimits.minPlayers) {
      this.#toLobby();

      return;
    }

    this.record.nextRound(holders);

    const first = nextFirstSeat(this.record.seats, this.record.lastWinner, random);
    const { state, events } = dealRound({ seats: this.record.seats, rules: settings.houseRules, handSize: settings.handSize, first, random });

    this.round = state;
    this.phase = 'round';
    this.beatUntil = 0;
    this.#record(events, 0);
    this.#startTurn(0);
  }

  #toLobby(): void {
    this.phase = 'lobby';
    this.round = null;
    this.#plans.cancel('clock');
  }

  // The turn's fuse (spec D11), plus the beat when a race just opened.
  #startTurn(extraMs: number): void {
    this.#clock(this.#host.settings().turnSeconds * 1000 + extraMs, () => this.#timeout());
  }

  #clock(delayMs: number, onEnd: () => void): void {
    this.#plans.cancel('clock');
    this.endsAt = this.#deps.now() + delayMs;
    this.#plans.later('clock', delayMs, onEnd);
  }

  #afterMove(wasBell: boolean): void {
    if (this.round?.winner) this.#endRound(this.round, this.round.winner);
    else if (!wasBell) this.#startTurn(Math.max(0, this.beatUntil - this.#deps.now()));
  }

  #timeout(): void {
    const round = this.round;

    if (this.phase !== 'round' || !round) return;

    const result = applyTimeout(round, this.#deps.random);

    if (!result.ok) return;

    this.#played = [...this.#played, { type: 'timedOut', seat: round.turn }];
    this.record.timedOut(round.turn);
    this.#apply(result, 0, false);
    this.#host.changed();
  }

  #endRound(round: RoundState, winner: string): void {
    const points = roundPoints(round, winner);
    const isMatchOver = this.record.win(winner, points, { ...round.hands }, this.#host.settings().targetScore);

    this.#host.system(winner, isMatchOver ? { type: 'matchWon', score: this.record.scores.get(winner) ?? 0 } : { type: 'roundWon', points });
    this.phase = isMatchOver ? 'podium' : 'roundOver';

    if (isMatchOver) {
      this.#plans.cancel('clock');

      return;
    }

    this.#clock(demoPace.roundOverMs, () => {
      this.#deal();
      this.#host.changed();
    });
  }
}
