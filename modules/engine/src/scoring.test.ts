import { expect, test } from 'vitest';
import { createDeck } from './deck.js';
import { cardPoints, handPoints } from './scoring.js';

test('numbers score their value, actions 20, wilds 50', () => {
  expect(cardPoints({ kind: 'number', colour: 'green', value: 0 })).toBe(0);
  expect(cardPoints({ kind: 'number', colour: 'green', value: 9 })).toBe(9);
  expect(cardPoints({ kind: 'reverse', colour: 'blue' })).toBe(20);
  expect(cardPoints({ kind: 'draw2', colour: 'red' })).toBe(20);
  expect(cardPoints({ kind: 'wild' })).toBe(50);
  expect(cardPoints({ kind: 'wild4' })).toBe(50);
});

test('a hand adds up its cards; the whole deck is worth 1240', () => {
  expect(handPoints([])).toBe(0);
  expect(handPoints(createDeck())).toBe(1240);
});
