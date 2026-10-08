// Playing a card, and what each card does (spec §5.3, §5.4, §5.7).
import { isWild, type Card, type NumberFace } from '@wild-table/protocol';
import { isFairWild4 } from '../plays.js';
import { playBlock, type PlayBlock, type PlayContext } from './play-now.js';
import { passHands } from './seven-zero.js';
import { closeRace, drawCards, handOf, passTurn, roundPoints, seatAfter, topCard } from './table.js';
import type { MoveError, RoundContext, RoundState, SeatId } from './types.js';

// What `seat` sees of the round, for the play checks.
const playContext = (state: RoundState, seat: SeatId): PlayContext => ({
  seat,
  hand: handOf(state, seat),
  turn: state.turn,
  step: state.step.kind,
  drawnCardId: state.step.kind === 'drawn' ? state.step.cardId : null,
  top: topCard(state),
  colour: state.colour,
  pendingDraw: state.pendingDraw,
  rules: state.rules,
});

const moveErrors: Record<PlayBlock, MoveError> = { notYourTurn: 'NOT_YOUR_TURN', noMatch: 'DOES_NOT_FIT', notDrawn: 'WRONG_STEP', notNow: 'WRONG_STEP' };

// May `seat` play `card` now? Null when it may, else why not.
export const playError = (state: RoundState, seat: SeatId, card: Card): MoveError | null => {
  const block = playBlock(playContext(state, seat), card);

  return block === null ? null : moveErrors[block];
};

// The victim of a +2 or +4 takes the cards and misses their turn.
export const takeTheCards = (context: RoundContext, victim: SeatId): void => {
  const { state } = context;

  drawCards(context, victim, state.pendingDraw, 'plus');
  state.pendingDraw = 0;
  state.wild4 = null;
  context.events.push({ type: 'skipped', seat: victim });
  passTurn(context, victim);
};

// A +2 (or a picked +4): the next player answers if they can, or takes the cards.
export const hitNext = (context: RoundContext, seat: SeatId, canAnswer: (victim: SeatId) => boolean): void => {
  const { state } = context;
  const victim = seatAfter(state, seat);

  if (!canAnswer(victim)) {
    takeTheCards(context, victim);

    return;
  }

  state.turn = victim;
  state.step = { kind: 'answer' };
  context.events.push({ type: 'turn', seat: victim });
};

const holds = (state: RoundState, seat: SeatId, kind: Card['kind']): boolean => handOf(state, seat).some((card) => card.kind === kind);

const playNumber = (context: RoundContext, seat: SeatId, card: NumberFace): void => {
  const { state } = context;

  if (state.rules.sevenZero && card.value === 7) {
    state.step = { kind: 'swap' };

    return;
  }

  if (state.rules.sevenZero && card.value === 0) passHands(context);

  passTurn(context, seat);
};

const applyEffect = (context: RoundContext, seat: SeatId, card: Card, bluff: boolean): void => {
  const { state } = context;

  if (card.kind === 'number') playNumber(context, seat, card);
  else if (card.kind === 'skip') {
    context.events.push({ type: 'skipped', seat: seatAfter(state, seat) });
    passTurn(context, seat, 1);
  } else if (card.kind === 'reverse') {
    state.direction = state.direction === 1 ? -1 : 1;
    context.events.push({ type: 'reversed', direction: state.direction });
    // With two players a Reverse works like a Skip.
    passTurn(context, seat, state.seats.length === 2 ? 1 : 0);
  } else if (card.kind === 'draw2') {
    state.pendingDraw += 2;
    hitNext(context, seat, (victim) => state.rules.stacking && holds(state, victim, 'draw2'));
  } else {
    if (card.kind === 'wild4') {
      state.pendingDraw += 4;
      state.wild4 = { seat, bluff };
    }

    state.step = { kind: 'pickColour' };
  }
};

// The last card is down: the round is over. A last +2 or +4 still makes the next player draw, and
// those cards count (spec §5.9).
const finishRound = (context: RoundContext, seat: SeatId, card: Card): void => {
  const { state } = context;

  if (card.kind === 'draw2' || card.kind === 'wild4') drawCards(context, seatAfter(state, seat), state.pendingDraw + (card.kind === 'draw2' ? 2 : 4), 'plus');

  state.pendingDraw = 0;
  state.wild4 = null;
  state.race = null;
  state.winner = seat;

  context.events.push({ type: 'roundOver', winner: seat, points: roundPoints(state, seat) });
};

// Down to one card: the Last card! race opens, unless they hit the bell early (spec §5.6).
const checkLastCard = (context: RoundContext, seat: SeatId): void => {
  const { state } = context;
  const calledEarly = state.earlyCall === seat;

  state.earlyCall = null;

  if (handOf(state, seat).length === 1 && !calledEarly) state.race = seat;
};

export const playCard = (context: RoundContext, seat: SeatId, cardId: string): MoveError | null => {
  const { state } = context;
  const hand = handOf(state, seat);
  const card = hand.find((candidate) => candidate.id === cardId);

  if (!card) return 'NOT_IN_HAND';

  const error = playError(state, seat, card);

  if (error) return error;

  const jumpIn = seat !== state.turn;

  closeRace(context, seat);
  state.hands[seat] = hand.filter((other) => other !== card);
  state.pile.push(card);
  state.turn = seat;

  if (!isWild(card)) state.colour = card.colour;

  context.events.push({ type: 'played', seat, card, jumpIn });

  if (handOf(state, seat).length === 0) {
    finishRound(context, seat, card);

    return null;
  }

  checkLastCard(context, seat);
  applyEffect(context, seat, card, card.kind === 'wild4' && !isFairWild4(hand, state.colour, state.rules));

  return null;
};
