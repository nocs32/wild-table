import { cardColours } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { allFaces, createDeck, faceKey } from './deck.js';

const deck = createDeck();

const countOf = (key: string): number => deck.filter((card) => faceKey(card) === key).length;

test('the deck has 108 cards, each with its own id', () => {
  expect(deck).toHaveLength(108);
  expect(new Set(deck.map((card) => card.id)).size).toBe(108);
});

test('each colour has one 0, and two each of 1 to 9, Skip, Reverse and +2', () => {
  cardColours.forEach((colour) => {
    expect(countOf(`${colour}-0`)).toBe(1);
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => countOf(`${colour}-${value}`))).toEqual([2, 2, 2, 2, 2, 2, 2, 2, 2]);
    expect(['skip', 'reverse', 'draw2'].map((kind) => countOf(`${colour}-${kind}`))).toEqual([2, 2, 2]);
  });
});

test('four Wild and four Wild +4', () => {
  expect(countOf('wild')).toBe(4);
  expect(countOf('wild4')).toBe(4);
});

test('every face once, for the card art', () => {
  expect(allFaces()).toHaveLength(54);
  expect(new Set(allFaces().map(faceKey)).size).toBe(54);
});
