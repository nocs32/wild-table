import { defaultGameSettings, type CardColour, type CardFace } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { allFaces } from './deck.js';
import { checkPlay, isFairWild4, type PileTop } from './plays.js';

const rules = defaultGameSettings.houseRules;
const red7: CardFace = { kind: 'number', colour: 'red', value: 7 };
const redSeven: PileTop = { card: red7, colour: 'red' };

const check = (card: CardFace, top: PileTop = redSeven, hand: CardFace[] = [card]): ReturnType<typeof checkPlay> => checkPlay(card, top, hand, rules);

test('a card fits by colour, by number, or by symbol', () => {
  expect(check({ kind: 'number', colour: 'red', value: 2 })).toEqual({ fits: true, reason: 'sameColour', bluff: false });
  expect(check({ kind: 'number', colour: 'blue', value: 7 })).toEqual({ fits: true, reason: 'sameNumber', bluff: false });
  expect(check({ kind: 'skip', colour: 'green' }, { card: { kind: 'skip', colour: 'blue' }, colour: 'blue' })).toEqual({ fits: true, reason: 'sameSymbol', bluff: false });
  expect(check({ kind: 'number', colour: 'yellow', value: 4 })).toEqual({ fits: false, reason: 'noMatch' });
  expect(check({ kind: 'skip', colour: 'green' })).toEqual({ fits: false, reason: 'noMatch' });
});

test('after a Wild, the picked colour counts, not the card', () => {
  const wildBlue: PileTop = { card: { kind: 'wild' }, colour: 'blue' };

  expect(check({ kind: 'number', colour: 'blue', value: 1 }, wildBlue).fits).toBe(true);
  expect(check({ kind: 'number', colour: 'red', value: 1 }, wildBlue).fits).toBe(false);
  expect(check({ kind: 'wild' }, wildBlue).fits).toBe(true);
});

test('wilds fit on everything', () => {
  const colours: CardColour[] = ['red', 'yellow', 'green', 'blue'];

  allFaces().forEach((topCard) => {
    colours.forEach((colour) => {
      expect(check({ kind: 'wild' }, { card: topCard, colour }).fits).toBe(true);
      expect(check({ kind: 'wild4' }, { card: topCard, colour }, [{ kind: 'wild4' }]).fits).toBe(true);
    });
  });
});

test('a Wild +4 is a bluff while the hand holds the colour in play', () => {
  const wild4: CardFace = { kind: 'wild4' };

  expect(check(wild4, redSeven, [wild4, { kind: 'number', colour: 'blue', value: 7 }])).toEqual({ fits: true, reason: 'wild4', bluff: false });
  expect(check(wild4, redSeven, [wild4, { kind: 'skip', colour: 'red' }])).toEqual({ fits: true, reason: 'wild4', bluff: true });
  expect(isFairWild4([{ kind: 'wild' }, { kind: 'wild4' }], 'red', rules)).toBe(true);
  expect(isFairWild4([{ kind: 'skip', colour: 'red' }], 'red', { wild4AnyTime: true })).toBe(true);
});
