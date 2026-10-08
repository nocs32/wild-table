// What one seat may see and do (spec D13, §6): its own hand, the pile, everyone's card counts, and
// the moves it has. Bots get exactly this, so they can't cheat; the cards that glow in a hand come
// from the same list (spec D7).
import { cardColours, type Card, type CardColour, type HouseRules } from '@wild-table/protocol';
import { playError } from './play.js';
import { handOf, topCard } from './table.js';
import type { Move, RoundState, SeatId, TurnStep } from './types.js';

export interface SeatView {
  seat: SeatId;
  hand: Card[];
  // The card just drawn that may still be played, when it's this seat's.
  drawnCardId: string | null;
  top: Card;
  colour: CardColour;
  turn: SeatId;
  // What the player whose turn it is is doing: everyone sees that much.
  step: TurnStep['kind'];
  seats: SeatId[];
  direction: 1 | -1;
  counts: Record<SeatId, number>;
  deckSize: number;
  pendingDraw: number;
  race: SeatId | null;
  rules: HouseRules;
}

export const seatView = (state: RoundState, seat: SeatId): SeatView => ({
  seat,
  hand: [...handOf(state, seat)],
  drawnCardId: state.turn === seat && state.step.kind === 'drawn' ? state.step.cardId : null,
  top: topCard(state),
  colour: state.colour,
  turn: state.turn,
  step: state.step.kind,
  seats: [...state.seats],
  direction: state.direction,
  counts: Object.fromEntries(state.seats.map((other) => [other, handOf(state, other).length])),
  deckSize: state.deck.length,
  pendingDraw: state.pendingDraw,
  race: state.race,
  rules: state.rules,
});

const canRing = (state: RoundState, seat: SeatId): boolean =>
  state.race !== null || (seat === state.turn && state.step.kind === 'play' && handOf(state, seat).length === 2);

const canChallenge = (state: RoundState): boolean => state.wild4 !== null && !state.rules.wild4AnyTime && topCard(state).kind === 'wild4';

// The moves besides playing a card, at each step of the turn.
const stepMoves = (state: RoundState, seat: SeatId): Move[] => {
  switch (state.step.kind) {
    case 'play':
      return [{ type: 'draw' }];
    case 'drawn':
      return [{ type: 'keep' }];
    case 'pickColour':
      return cardColours.map((colour) => ({ type: 'pickColour', colour }));
    case 'answer':
      return [...(canChallenge(state) ? [{ type: 'challenge' } as const] : []), { type: 'take' }];
    case 'swap':
      return state.seats.filter((other) => other !== seat).map((target) => ({ type: 'swap', target }));
  }
};

// Every move `seat` may make now: the cards it may play, the rest of its turn's choices, and the
// bell when there's a race to win (or two cards left on its own turn).
export const legalMoves = (state: RoundState, seat: SeatId): Move[] => {
  if (state.winner !== null || !state.seats.includes(seat)) return [];

  const plays: Move[] = handOf(state, seat)
    .filter((card) => playError(state, seat, card) === null)
    .map((card) => ({ type: 'play', cardId: card.id }));

  const bell: Move[] = canRing(state, seat) ? [{ type: 'bell' }] : [];

  return seat === state.turn ? [...plays, ...stepMoves(state, seat), ...bell] : [...plays, ...bell];
};
