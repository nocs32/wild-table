// The table's mechanics, shared by every move: who's next, drawing from the deck, and the pile
// going back into the deck when it runs out.
import type { Card, DrawReason } from '@wild-table/protocol';
import { shuffle } from '../random.js';
import { handPoints } from '../scoring.js';
import type { MoveError, RoundContext, RoundState, SeatId, TurnStep } from './types.js';

export const topCard = (state: RoundState): Card => state.pile[state.pile.length - 1] as Card;

export const handOf = (state: RoundState, seat: SeatId): Card[] => state.hands[seat] ?? [];

// What the winner scores: every card left in the other hands (spec §5.9).
export const roundPoints = (state: RoundState, winner: SeatId): number =>
  state.seats.filter((seat) => seat !== winner).reduce((total, seat) => total + handPoints(handOf(state, seat)), 0);

// The seat `steps` places on from `seat`, in the direction of play.
export const seatAfter = (state: RoundState, seat: SeatId, steps = 1): SeatId => {
  const count = state.seats.length;
  const index = state.seats.indexOf(seat);

  return state.seats[(((index + state.direction * steps) % count) + count) % count] as SeatId;
};

// The turn moves on: to the next seat, or further when someone is skipped.
export const passTurn = (context: RoundContext, from: SeatId, skip = 0): void => {
  const { state } = context;

  state.turn = seatAfter(state, from, 1 + skip);
  state.step = { kind: 'play' };
  // A Last card! call made early lasts only for the turn it was made in.
  state.earlyCall = null;
  context.events.push({ type: 'turn', seat: state.turn });
};

// When the deck runs out, the pile (all but its top card) is shuffled into a new deck (spec §5.3).
const refill = (context: RoundContext): void => {
  const { state } = context;

  if (state.deck.length > 0 || state.pile.length < 2) return;

  const top = topCard(state);

  state.deck = shuffle(state.pile.slice(0, -1), context.random);
  state.pile = [top];
  context.events.push({ type: 'reshuffled' });
};

// The deck's top card, refilling the deck from the pile first if it's empty; null when every card
// is in someone's hand.
export const takeFromDeck = (context: RoundContext): Card | null => {
  refill(context);

  return context.state.deck.pop() ?? null;
};

// Cards go into a hand. Someone in the Last card! race who gets cards is out of it.
export const giveCards = (context: RoundContext, seat: SeatId, cards: Card[], reason: DrawReason): void => {
  const { state } = context;

  state.hands[seat] = [...handOf(state, seat), ...cards];

  if (state.race === seat && cards.length > 0) state.race = null;

  context.events.push({ type: 'drew', seat, cards, reason });
};

// Takes `count` cards off the deck into a hand (fewer if every card is in someone's hand).
export const drawCards = (context: RoundContext, seat: SeatId, count: number, reason: DrawReason): Card[] => {
  const drawn: Card[] = [];

  for (let left = count; left > 0; left--) {
    const card = takeFromDeck(context);

    if (!card) break;

    drawn.push(card);
  }

  giveCards(context, seat, drawn, reason);

  return drawn;
};

// Only the player whose turn it is, and only at this step.
export const stepError = (context: RoundContext, seat: SeatId, kind: TurnStep['kind']): MoveError | null => {
  if (seat !== context.state.turn) return 'NOT_YOUR_TURN';

  return context.state.step.kind === kind ? null : 'WRONG_STEP';
};

// Hands changed places (7-0): whoever now holds a single card is in the Last card! race, the
// nearest in the order of play after `from` when there are several (spec §5.6, §5.7).
export const raceAfterSwap = (context: RoundContext, from: SeatId): void => {
  const { state } = context;

  state.race = null;

  for (let step = 1; step <= state.seats.length; step++) {
    const seat = seatAfter(state, from, step);

    if (handOf(state, seat).length === 1) {
      state.race = seat;

      return;
    }
  }
};

// The Last card! race ends, unanswered, once the next player plays or draws (spec §5.6).
export const closeRace = (context: RoundContext, actor: SeatId): void => {
  if (context.state.race !== null && context.state.race !== actor) context.state.race = null;
};
