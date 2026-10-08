import { botJumpInDelay, botMove, handOf, legalMoves, seatView, type Move, type RoundState } from '@wild-table/engine';
import type { DemoMatch } from './match';
import { DemoPlans } from './plans';
import type { DemoDeps } from './types';

// How long a bot thinks before its move, as at a live table (core-api `limits.ts`, spec §6).
const thinkMs = { min: 1000, max: 3000 };

export interface DemoPlayersHost {
  match: DemoMatch;
  // A seat played by a bot: a bot, a sample player, or someone a bot stands in for.
  isBot: (seat: string) => boolean;
  // A bot moved: everyone needs to hear about it.
  moved: () => void;
}

// The demo table's bots (spec §6.1): every seat but yours is played by the engine's planning bot,
// as live tables play bot seats, after a human-ish think (the Last card! bell is one of their
// moves); with Jump-in on they slap down the exact card on top out of turn.
export class DemoPlayers {
  #thinkingKey: string | null = null;
  #jumpKey: string | null = null;
  readonly #deps: DemoDeps;
  readonly #host: DemoPlayersHost;
  readonly #plans: DemoPlans<'think' | 'jumps'>;

  constructor(deps: DemoDeps, host: DemoPlayersHost) {
    this.#deps = deps;
    this.#host = host;
    this.#plans = new DemoPlans(deps.schedule);
  }

  // After every change: the bot whose turn it is starts thinking, and bots holding the top card may jump in.
  drive(): void {
    const { round, phase } = this.#host.match;

    if (phase !== 'round' || !round) {
      this.cancel();

      return;
    }

    this.#planTurn(round);
    this.#planJumpIns(round);
  }

  cancel(): void {
    this.#plans.cancelAll();
    this.#thinkingKey = null;
    this.#jumpKey = null;
  }

  // One think per decision: a new decision (another turn, another step) replaces the old one.
  #planTurn(round: RoundState): void {
    const seat = round.turn;
    const key = [seat, round.step.kind, round.pile.length, round.deck.length, handOf(round, seat).length].join('|');

    if (key === this.#thinkingKey) return;

    this.#plans.cancel('think');
    this.#thinkingKey = key;

    if (!this.#host.isBot(seat)) return;

    const { random } = this.#deps;
    const delay = thinkMs.min + random() * (thinkMs.max - thinkMs.min);

    this.#plans.later('think', delay, () => this.#play(seat));
  }

  #play(seat: string): void {
    const round = this.#host.match.round;

    this.#thinkingKey = null;

    if (!round) return;

    this.#move(seat, botMove('planner', seatView(round, seat), legalMoves(round, seat), this.#deps.random));
  }

  // A new card on the pile: bots holding the same card may jump in (spec §5.7).
  #planJumpIns(round: RoundState): void {
    const key = round.rules.jumpIn ? `${round.pile.length}|${round.deck.length}|${round.turn}` : null;

    if (key === this.#jumpKey) return;

    this.#plans.cancel('jumps');
    this.#jumpKey = key;

    if (key === null) return;

    const { random } = this.#deps;

    round.seats
      .filter((seat) => seat !== round.turn && this.#host.isBot(seat))
      .forEach((seat) => {
        const delay = botJumpInDelay(seatView(round, seat), legalMoves(round, seat), random);

        if (delay !== null) this.#plans.later('jumps', delay, () => this.#jumpIn(seat));
      });
  }

  #jumpIn(seat: string): void {
    const round = this.#host.match.round;
    const move = round ? botMove('planner', seatView(round, seat), legalMoves(round, seat), this.#deps.random) : null;

    this.#move(seat, move?.type === 'play' ? move : null);
  }

  // A bot's move can come too late (the turn moved on, the round ended): that's fine.
  #move(seat: string, move: Move | null): void {
    if (move) this.#host.match.move(seat, move, 0.5, false);

    this.#host.moved();
  }
}
