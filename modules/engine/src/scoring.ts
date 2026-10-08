// Scoring (spec §5.9): the round's winner scores every card left in the other hands.
import { isWild, type CardFace } from '@wild-table/protocol';

export const actionPoints = 20;
export const wildPoints = 50;

// Number cards at face value, Skip, Reverse and +2 at 20, Wild and Wild +4 at 50.
export const cardPoints = (card: CardFace): number => {
  if (card.kind === 'number') return card.value;

  return isWild(card) ? wildPoints : actionPoints;
};

export const handPoints = (hand: readonly CardFace[]): number => hand.reduce((total, card) => total + cardPoints(card), 0);
