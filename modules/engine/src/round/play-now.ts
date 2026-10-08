// May a seat play a card right now, and if not, why (spec D7)? Worked out from what the seat itself
// can see, so the server's rules, the bots, the glow in a hand and the "why not" captions agree.
import { isWild, type Card, type CardColour, type HouseRules } from '@wild-table/protocol';
import { checkPlay } from '../plays.js';
import type { SeatId, TurnStep } from './types.js';

export interface PlayContext {
  seat: SeatId;
  hand: readonly Card[];
  turn: SeatId;
  step: TurnStep['kind'];
  // The card just drawn that may still be played, when it's this seat's turn.
  drawnCardId: string | null;
  top: Card;
  colour: CardColour;
  pendingDraw: number;
  rules: HouseRules;
}

// Why not: it's someone else's turn; it doesn't match the pile; only the card just drawn may be
// played; or the turn is at another step (answering a +2 or +4, picking a colour or a hand).
export type PlayBlock = 'notYourTurn' | 'noMatch' | 'notDrawn' | 'notNow';

// The exact same card: same colour, and the same number or symbol. Wilds never are (jump-in).
export const isSameCard = (card: Card, other: Card): boolean => {
  if (isWild(card) || isWild(other) || card.kind !== other.kind || card.colour !== other.colour) return false;

  return card.kind !== 'number' || (other.kind === 'number' && card.value === other.value);
};

// Answering a +2 with a +2, or a +4 with a +4 (the stacking house rule).
export const isStackOn = (top: Card, card: Card, pendingDraw: number, rules: HouseRules): boolean =>
  rules.stacking && pendingDraw > 0 && (card.kind === 'draw2' || card.kind === 'wild4') && card.kind === top.kind;

// Null when `card` may be played now.
export const playBlock = (context: PlayContext, card: Card): PlayBlock | null => {
  const { step, top } = context;

  if (context.seat !== context.turn) return context.rules.jumpIn && step === 'play' && isSameCard(card, top) ? null : 'notYourTurn';

  if (step === 'play') return checkPlay(card, { card: top, colour: context.colour }, context.hand, context.rules).fits ? null : 'noMatch';

  if (step === 'drawn') return context.drawnCardId === card.id ? null : 'notDrawn';

  return step === 'answer' && isStackOn(top, card, context.pendingDraw, context.rules) ? null : 'notNow';
};
