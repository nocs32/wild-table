import { expect, test } from 'vitest';
import { after, codesOf, makeRound, move, play } from './test-round.js';

const bell = { type: 'bell' } as const;

test('the bell: on your turn, instead of playing, everyone else on one card draws 2 and you draw 1', () => {
  const state = makeRound({ hands: { a: ['r2', 'b1', 'g3'], b: ['y1'], c: ['g4'], d: ['y5', 'y6'] }, top: 'r7' });
  const rung = move(state, 'a', bell);
  const after1 = after(rung);

  expect(rung.ok && rung.events[0]).toEqual({ type: 'bell', seat: 'a', hit: ['b', 'c'] });
  expect([after1.hands.a?.length, after1.hands.b?.length, after1.hands.c?.length, after1.hands.d?.length]).toEqual([4, 3, 3, 2]);
  expect(after1.turn).toBe('b');
});

test('the bell needs your turn, the play step, and someone else down to one card', () => {
  const state = makeRound({ hands: { a: ['r2', 'b1'], b: ['y1'], c: ['g4', 'g5'] }, top: 'r7' });

  expect(move(state, 'b', bell)).toEqual({ ok: false, error: 'NOT_YOUR_TURN' });
  expect(move({ ...state, step: { kind: 'swap' } }, 'a', bell)).toEqual({ ok: false, error: 'WRONG_STEP' });
  expect(move({ ...state, turn: 'c' }, 'c', bell).ok).toBe(true);
  expect(move(makeRound({ hands: { a: ['r2'], b: ['y1', 'y2'] }, top: 'r7' }), 'a', bell)).toEqual({ ok: false, error: 'NO_TARGET' });
});

test('stacking: answer a +2 with a +2, and whoever can’t answer draws the lot', () => {
  const rules = { stacking: true };
  const answering = after(play(makeRound({ hands: { a: ['r+', 'r1'], b: ['b+', 'y2'], c: ['g1', 'g2'] }, top: 'r7', rules }), 'a', 'r+'));

  expect([answering.turn, answering.step.kind, answering.pendingDraw]).toEqual(['b', 'answer', 2]);

  const stacked = after(play(answering, 'b', 'b+'));

  expect([stacked.hands.c?.length, stacked.pendingDraw, stacked.turn]).toEqual([6, 0, 'a']);
});

test('jump-in: the exact same card, slapped down out of turn; play carries on from there', () => {
  const state = makeRound({ hands: { a: ['b1', 'b2'], b: ['y1', 'y2'], c: ['r7', 'g2'] }, top: 'r7', rules: { jumpIn: true } });

  expect(play(state, 'c', 'r7').ok).toBe(true);
  expect(after(play(state, 'c', 'r7')).turn).toBe('a');
  expect(play(makeRound({ hands: { a: ['b1'], b: ['y1'], c: ['r7'] }, top: 'r7' }), 'c', 'r7')).toEqual({ ok: false, error: 'NOT_YOUR_TURN' });
});

test('7-0: a 7 swaps hands with a player you pick; a 0 passes every hand along', () => {
  const rules = { sevenZero: true };
  const swapping = after(play(makeRound({ hands: { a: ['r7', 'r1', 'r2'], b: ['y1'], c: ['g1', 'g2'] }, top: 'r5', rules }), 'a', 'r7'));

  expect(swapping.step.kind).toBe('swap');

  const swapped = after(move(swapping, 'a', { type: 'swap', target: 'c' }));

  expect([codesOf(swapped, 'a'), codesOf(swapped, 'c'), swapped.turn]).toEqual([['g1', 'g2'], ['r1', 'r2'], 'b']);

  const passed = after(play(makeRound({ hands: { a: ['r0', 'r1'], b: ['y1'], c: ['g1', 'g2'] }, top: 'r5', rules }), 'a', 'r0'));

  expect([codesOf(passed, 'a'), codesOf(passed, 'b'), codesOf(passed, 'c')]).toEqual([['g1', 'g2'], ['r1'], ['y1']]);
});

test('draw until you can play: drawing goes on until a card fits', () => {
  const state = after(move(makeRound({ hands: { a: ['b1'], b: ['y1'] }, top: 'r7', deck: ['r2', 'g4', 'y5'], rules: { drawUntilPlayable: true } }), 'a', { type: 'draw' }));

  expect(codesOf(state, 'a')).toEqual(['b1', 'y5', 'g4', 'r2']);
  expect(state.step.kind).toBe('drawn');
});

test('+4 any time: never a bluff, and no challenge', () => {
  const rules = { wild4AnyTime: true };
  const picked = after(move(after(play(makeRound({ hands: { a: ['W4', 'g1'], b: ['y1'], c: ['b1'] }, top: 'g7', rules }), 'a', 'W4')), 'a', { type: 'pickColour', colour: 'blue' }));

  expect([picked.hands.b?.length, picked.turn]).toEqual([5, 'c']);
});

test('each player may ring the bell once a round', () => {
  const state = makeRound({ hands: { a: ['r2', 'b1', 'g3'], b: ['y1'], c: ['g4', 'g5', 'g6'] }, top: 'r7' });
  const rung = after(move(state, 'a', bell));
  const again = { ...rung, turn: 'a', hands: { ...rung.hands, c: rung.hands.c?.slice(0, 1) ?? [] } };

  expect(rung.bellsRung).toEqual(['a']);
  expect(move(again, 'a', bell)).toEqual({ ok: false, error: 'BELL_USED' });
  expect(move({ ...again, turn: 'b' }, 'b', bell).ok).toBe(true);
});
