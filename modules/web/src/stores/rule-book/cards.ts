import { faceKey, type PileTop, type PlayCheck } from '@wild-table/engine';
import { isWild, type CardFace } from '@wild-table/protocol';
import type { ArtStore } from '../art';
import type { Translate } from '../locale';

// A card as the rule book shows it: its picture (null until the art is drawn) and its name, for
// screen readers and the captions.
export interface CardView {
  key: string;
  url: string | null;
  label: string;
}

// A card with a ✅ or a ❌, and why.
export interface MarkedCardView extends CardView {
  fits: boolean;
  note: string;
}

export interface CardContext {
  t: Translate;
  art: ArtStore;
}

// "Red 7", "Blue Skip", "Wild +4".
export const cardLabel = (face: CardFace, t: Translate): string => {
  if (isWild(face)) return t(`cards.${face.kind}`);

  const colour = t(`cards.colours.${face.colour}`);

  return face.kind === 'number' ? t('cards.number', { colour, value: face.value }) : t(`cards.${face.kind}`, { colour });
};

export const cardView = (face: CardFace, { t, art }: CardContext, key = faceKey(face)): CardView => ({ key, url: art.faceUrl(face), label: cardLabel(face, t) });

// Why a card fits on the pile, or why it doesn't (spec D7).
export const fitNote = (result: PlayCheck, top: PileTop, t: Translate): string => {
  if (!result.fits) return t('book.fit.noMatch');

  if (result.bluff) return t('book.fit.bluff', { colour: t(`cards.colourNames.${top.colour}`) });

  return t(`book.fit.${result.reason}`);
};
