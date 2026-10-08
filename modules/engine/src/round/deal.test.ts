import { defaultGameSettings } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { createRandom } from '../random.js';
import { applyTimeout, timeoutMove } from './apply.js';
import { dealRound, nextFirstSeat } from './deal.js';
import { after, codesOf, makeRound, move } from './test-round.js';
import { legalMoves, seatView } from './view.js';

const seats = ['a', 'b', 'c', 'd'];
const deal = (seed: number, handSize = 7): ReturnType<typeof dealRound> => dealRound({ seats, rules: defaultGameSettings.houseRules, handSize, first: 'a', random: createRandom(seed) });

test('everyone is dealt the hand size, one card is turned up, and all 108 are there', () => {
  const { state, events } = deal(3, 5);
  const held = seats.reduce((total, seat) => total + (state.hands[seat]?.length ?? 0), 0);

  expect(seats.slice(1).map((seat) => state.hands[seat]?.length)).toEqual([5, 5, 5]);
  expect(state.pile).toHaveLength(1);
  expect(state.deck.length + state.pile.length + held).toBe(108);
  expect(events[0]).toEqual({ type: 'flipped', card: state.pile[0] });
});

test('the first card is never a Wild +4, and its effect hits the first player', () => {
  Array.from({ length: 300 }, (_, seed) => deal(seed)).forEach(({ state }) => {
    const first = state.pile[0];

    expect(first?.kind).not.toBe('wild4');

    if (first?.kind === 'skip') expect(state.turn).toBe('b');

    if (first?.kind === 'draw2') expect([state.turn, state.hands.a?.length]).toEqual(['b', 9]);

    if (first?.kind === 'reverse') expect([state.turn, state.direction]).toEqual(['d', -1]);

    if (first?.kind === 'wild') expect([state.turn, state.step.kind]).toEqual(['a', 'pickColour']);
  });
});

test('an opening Wild: the first player picks the colour, then plays', () => {
  const opening = { ...makeRound({ hands: { a: ['b1'], b: ['y1'] }, top: 'W' }), pile: [{ kind: 'wild', id: 'W#opening' }] as const, step: { kind: 'pickColour' } as const };
  const picked = after(move({ ...opening, pile: [...opening.pile] }, 'a', { type: 'pickColour', colour: 'blue' }));

  expect([picked.turn, picked.step.kind, picked.colour]).toEqual(['a', 'play', 'blue']);
});

test('the next round starts after the last winner; the first one at a random seat', () => {
  expect(nextFirstSeat(seats, 'b', createRandom(1))).toBe('c');
  expect(nextFirstSeat(seats, 'd', createRandom(1))).toBe('a');
  expect(seats).toContain(nextFirstSeat(seats, null, createRandom(1)));
});

test('out of time: draw and pass (even if it fits), or keep, pick, take, swap', () => {
  const state = makeRound({ hands: { a: ['b1', 'g1', 'g2'], b: ['y1'], c: ['r1', 'r2'] }, top: 'r7', deck: ['r3'] });
  const timedOut = after(applyTimeout(state, createRandom(1)));

  expect([codesOf(timedOut, 'a'), timedOut.turn]).toEqual([['b1', 'g1', 'g2', 'r3'], 'b']);
  expect(timeoutMove({ ...state, step: { kind: 'pickColour' } })).toEqual({ type: 'pickColour', colour: 'green' });
  expect(timeoutMove({ ...state, step: { kind: 'answer' } })).toEqual({ type: 'take' });
  expect(timeoutMove({ ...state, step: { kind: 'swap' } })).toEqual({ type: 'swap', target: 'b' });
});

test('a seat sees its own hand and everyone’s counts, never another hand', () => {
  const state = makeRound({ hands: { a: ['r2', 'b7', 'W'], b: ['y1', 'y2'] }, top: 'r7' });
  const view = seatView(state, 'b');

  expect(view.hand.map((one) => one.id.split('#')[0])).toEqual(['y1', 'y2']);
  expect(view.counts).toEqual({ a: 3, b: 2 });
  expect(JSON.stringify(view)).not.toContain('b7');
});

test('legal moves: the cards that fit, drawing, and the bell when there’s a race', () => {
  const state = makeRound({ hands: { a: ['r2', 'b7', 'W', 'gS'], b: ['y1', 'y2'] }, top: 'r7' });

  expect(legalMoves(state, 'a').map((one) => (one.type === 'play' ? one.cardId.split('#')[0] : one.type))).toEqual(['r2', 'b7', 'W', 'draw']);
  expect(legalMoves(state, 'b')).toEqual([]);
  expect(legalMoves({ ...state, race: 'a' }, 'b')).toEqual([{ type: 'bell' }]);
});
