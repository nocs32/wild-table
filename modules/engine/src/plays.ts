// Which card fits on the pile, and why (spec §5.3). The game's glow, the "why not" captions and
// the rule book's ✅ and ❌ all come from here, so they can't disagree (spec D7, §9.1).
import { isWild, type CardColour, type CardFace, type HouseRules } from '@wild-table/protocol';

// The pile as it matters for the next play: the top card, and the colour in play (the top card's
// own, or the one picked with a Wild).
export interface PileTop {
  card: CardFace;
  colour: CardColour;
}

export type FitReason = 'sameColour' | 'sameNumber' | 'sameSymbol' | 'wild' | 'wild4';

export type PlayCheck =
  // `bluff`: a Wild +4 played while holding the colour in play. Allowed, but it can be challenged (§5.5).
  | { fits: true; reason: FitReason; bluff: boolean }
  | { fits: false; reason: 'noMatch' };

const fit = (reason: FitReason, bluff = false): PlayCheck => ({ fits: true, reason, bluff });

// A Wild +4 is fair when no other card in the hand has the colour in play. With the "+4 any time"
// house rule, it always is.
export const isFairWild4 = (hand: readonly CardFace[], colour: CardColour, rules: Pick<HouseRules, 'wild4AnyTime'>): boolean =>
  rules.wild4AnyTime || !hand.some((other) => !isWild(other) && other.colour === colour);

export const checkPlay = (card: CardFace, top: PileTop, hand: readonly CardFace[], rules: Pick<HouseRules, 'wild4AnyTime'>): PlayCheck => {
  if (isWild(card)) return card.kind === 'wild' ? fit('wild') : fit('wild4', !isFairWild4(hand, top.colour, rules));

  if (card.colour === top.colour) return fit('sameColour');

  if (card.kind === 'number' && top.card.kind === 'number' && card.value === top.card.value) return fit('sameNumber');

  if (card.kind !== 'number' && card.kind === top.card.kind) return fit('sameSymbol');

  return { fits: false, reason: 'noMatch' };
};
