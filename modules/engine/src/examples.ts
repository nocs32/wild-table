// The rule book's examples (spec §9.1), made of real cards. The book marks each card with
// checkPlay and adds points up with cardPoints, so the book can't disagree with the game; the
// tests check what each page shows.
import type { ActionKind, CardColour, CardFace, HouseRule } from '@wild-table/protocol';
import type { PileTop } from './plays.js';

const num = (colour: CardColour, value: number): CardFace => ({ kind: 'number', colour, value });
const act = (colour: CardColour, kind: ActionKind): CardFace => ({ kind, colour });
const wild: CardFace = { kind: 'wild' };
const wild4: CardFace = { kind: 'wild4' };

const top = (card: CardFace, colour: CardColour): PileTop => ({ card, colour });

// A pile and a hand: each card in the hand gets a ✅ or a ❌.
export interface PlayExample {
  top: PileTop;
  hand: CardFace[];
}

export const ruleBookExamples: {
  goal: CardFace[];
  turn: PlayExample;
  turnTry: PlayExample;
  specials: CardFace[];
  specialsTry: PlayExample;
  fairWild4: PlayExample;
  bluffWild4: PlayExample;
  scoring: CardFace[][];
  values: CardFace[];
  houseRules: Record<HouseRule, CardFace[]>;
} = {
  // Page 1: a hand, as only its owner sees it.
  goal: [num('green', 3), act('red', 'skip'), num('blue', 9), num('yellow', 1), wild],
  // Page 2: what fits on a red 7.
  turn: { top: top(num('red', 7), 'red'), hand: [num('red', 2), num('blue', 7), wild, act('green', 'skip'), num('yellow', 4)] },
  // Page 2's "Try it": play your way through a hand.
  turnTry: { top: top(num('blue', 3), 'blue'), hand: [num('blue', 8), num('yellow', 3), act('red', 'skip'), wild, num('green', 6)] },
  // Page 3: the special cards, one each.
  specials: [act('red', 'skip'), act('green', 'reverse'), act('blue', 'draw2'), wild, wild4],
  // Page 3's "Try it": special cards on a yellow +2.
  specialsTry: { top: top(act('yellow', 'draw2'), 'yellow'), hand: [act('red', 'draw2'), act('yellow', 'skip'), act('blue', 'reverse'), wild, wild4] },
  // Page 4: the same +4 on a blue 3, fair in one hand and a bluff in the other.
  fairWild4: { top: top(num('blue', 3), 'blue'), hand: [num('red', 5), num('green', 8), wild4] },
  bluffWild4: { top: top(num('blue', 3), 'blue'), hand: [num('blue', 9), num('red', 1), wild4] },
  // Page 6: the hands left over when the round's winner plays their last card.
  scoring: [
    [num('yellow', 8), act('blue', 'skip')],
    [wild, num('green', 3), num('red', 0)],
    [act('red', 'draw2'), act('blue', 'reverse'), num('yellow', 6), num('green', 9)],
  ],
  // Page 6: one card of each kind of value.
  values: [num('blue', 8), act('red', 'skip'), wild],
  // Page 7: a few cards to show each house rule.
  houseRules: {
    stacking: [act('red', 'draw2'), act('blue', 'draw2')],
    jumpIn: [num('green', 5), num('green', 5)],
    sevenZero: [num('red', 7), num('blue', 0)],
    drawUntilPlayable: [num('yellow', 2), num('blue', 6), num('green', 4)],
    wild4AnyTime: [wild4],
  },
};
