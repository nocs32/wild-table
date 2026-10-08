import { applyMove, applyTimeout, dealRound, handOf, legalMoves, nextFirstSeat, seatView, type Move, type MoveError, type RoundEvent, type RoundState, type SeatView } from '@wild-table/engine';
import type { GameSettings, HandSnapshot, TableErrorCode } from '@wild-table/protocol';
import { TableRoomError } from './error.js';

// The engine's refusals are the protocol's error codes, but for a round that's already over.
const refusal = (error: MoveError): TableRoomError => new TableRoomError(error === 'ROUND_OVER' ? 'WRONG_PHASE' : (error satisfies TableErrorCode));

export interface TableRoomCardsDeps {
  random: () => number;
}

// The deck, the pile and the hands (spec §10.3): the engine's round, kept here and changed only by
// the engine's moves. A refused move throws its typed error and changes nothing.
export class TableRoomCards {
  #round: RoundState | null = null;
  readonly #deps: TableRoomCardsDeps;

  constructor(deps: TableRoomCardsDeps) {
    this.#deps = deps;
  }

  get round(): RoundState | null {
    return this.#round;
  }

  get winner(): string | null {
    return this.#round?.winner ?? null;
  }

  deal(seats: string[], settings: GameSettings, lastWinner: string | null): RoundEvent[] {
    const first = nextFirstSeat(seats, lastWinner, this.#deps.random);
    const { state, events } = dealRound({ seats, rules: settings.houseRules, handSize: settings.handSize, first, random: this.#deps.random });

    this.#round = state;

    return events;
  }

  move(seat: string, move: Move): RoundEvent[] {
    const round = this.#playing();
    const result = applyMove(round, seat, move, this.#deps.random);

    if (!result.ok) throw refusal(result.error);

    this.#round = result.state;

    return result.events;
  }

  // The turn's time ran out (spec D11).
  timeout(): RoundEvent[] {
    const result = applyTimeout(this.#playing(), this.#deps.random);

    if (!result.ok) throw refusal(result.error);

    this.#round = result.state;

    return result.events;
  }

  // A seat's own cards (D13): for its person alone.
  hand(seat: string): HandSnapshot | null {
    const round = this.#round;

    if (!round || !round.seats.includes(seat)) return null;

    return { cards: [...handOf(round, seat)], drawnCardId: round.turn === seat && round.step.kind === 'drawn' ? round.step.cardId : null };
  }

  cardsOf(seat: string): number {
    return this.#round ? handOf(this.#round, seat).length : 0;
  }

  // What a seat may see and do, for its bot.
  view(seat: string): SeatView {
    return seatView(this.#playing(), seat);
  }

  legal(seat: string): Move[] {
    return this.#round ? legalMoves(this.#round, seat) : [];
  }

  clear(): void {
    this.#round = null;
  }

  #playing(): RoundState {
    if (!this.#round) throw new TableRoomError('WRONG_PHASE');

    return this.#round;
  }
}
