// Shuffling, dealing and turning up the first card (spec §5.2).
import { isWild, type Card, type HouseRules } from '@wild-table/protocol';
import { createDeck } from '../deck.js';
import { shuffle } from '../random.js';
import { drawCards, passTurn } from './table.js';
import type { RoundContext, RoundEvent, RoundState, SeatId } from './types.js';

export interface DealOptions {
  seats: SeatId[];
  rules: HouseRules;
  handSize: number;
  // Who plays first: a random seat in the first round, then the seat after the last winner.
  first: SeatId;
  random: () => number;
}

// The first card turned up: a Wild +4 goes back into the deck and another is turned.
const turnUp = (deck: Card[], random: () => number): Card => {
  for (;;) {
    const card = deck.pop() as Card;

    if (card.kind !== 'wild4') return card;

    deck.splice(Math.floor(random() * (deck.length + 1)), 0, card);
  }
};

// An action card turned up hits the first player; a Wild lets them pick the colour.
const openWith = (context: RoundContext, card: Card, first: SeatId): void => {
  const { state } = context;

  if (card.kind === 'wild') {
    state.step = { kind: 'pickColour' };
  } else if (card.kind === 'skip') {
    context.events.push({ type: 'skipped', seat: first });
    passTurn(context, first);
  } else if (card.kind === 'draw2') {
    drawCards(context, first, 2, 'plus');
    context.events.push({ type: 'skipped', seat: first });
    passTurn(context, first);
  } else if (card.kind === 'reverse') {
    // The dealer (the seat before the first player) plays first, and play goes the other way.
    state.direction = -1;
    context.events.push({ type: 'reversed', direction: -1 });
    passTurn(context, first);
  }
};

export const dealRound = ({ seats, rules, handSize, first, random }: DealOptions): { state: RoundState; events: RoundEvent[] } => {
  const deck = shuffle(createDeck(), random);
  const hands = Object.fromEntries(seats.map((seat) => [seat, deck.splice(-handSize)]));
  const card = turnUp(deck, random);

  const state: RoundState = {
    seats: [...seats],
    hands,
    deck,
    pile: [card],
    colour: isWild(card) ? 'red' : card.colour,
    turn: first,
    direction: 1,
    step: { kind: 'play' },
    pendingDraw: 0,
    wild4: null,
    race: null,
    earlyCall: null,
    rules,
    winner: null,
  };

  const context: RoundContext = { state, events: [{ type: 'flipped', card }], random };

  openWith(context, card, first);

  if (card.kind === 'number' || card.kind === 'wild') context.events.push({ type: 'turn', seat: first });

  return { state, events: context.events };
};

// Who plays first in the next round: the seat after the last round's winner (spec §5.2).
export const nextFirstSeat = (seats: SeatId[], lastWinner: SeatId | null, random: () => number): SeatId => {
  const index = lastWinner === null ? -1 : seats.indexOf(lastWinner);

  if (index < 0) return seats[Math.floor(random() * seats.length)] as SeatId;

  return seats[(index + 1) % seats.length] as SeatId;
};
