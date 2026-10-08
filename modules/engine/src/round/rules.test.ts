import { expect, test } from 'vitest';
import { after, codesOf, makeRound, move, play } from './test-round.js';

const bell = { type: 'bell' } as const;

test('down to one card opens the race; hitting the bell first keeps you safe', () => {
  const racing = after(play(makeRound({ hands: { a: ['r2', 'b1'], b: ['y1', 'y2'] }, top: 'r7' }), 'a', 'r2'));

  expect(racing.race).toBe('a');

  const safe = move(racing, 'a', bell);

  expect(after(safe).race).toBeNull();
  expect(safe.ok && safe.events).toEqual([{ type: 'bell', seat: 'a', result: 'safe', caught: null }]);
});

test('caught: someone else hits the bell first, and the last card’s player draws 2', () => {
  const racing = after(play(makeRound({ hands: { a: ['r2', 'b1'], b: ['y1', 'y2'] }, top: 'r7' }), 'a', 'r2'));
  const caught = after(move(racing, 'b', bell));

  expect([caught.race, caught.hands.a?.length]).toEqual([null, 3]);
});

test('the race ends once the next player plays or draws; with no race, the bell does nothing', () => {
  const racing = after(play(makeRound({ hands: { a: ['r2', 'b1'], b: ['y1', 'y2'] }, top: 'r7', deck: ['g4'] }), 'a', 'r2'));
  const drawn = after(move(racing, 'b', { type: 'draw' }));

  expect(drawn.race).toBeNull();
  expect(move(drawn, 'a', bell)).toEqual({ ok: false, error: 'NO_RACE' });
});

test('hitting the bell early, holding two cards on your turn, means no race', () => {
  const early = after(move(makeRound({ hands: { a: ['r2', 'b1'], b: ['y1'] }, top: 'r7' }), 'a', bell));

  expect(early.earlyCall).toBe('a');
  expect(after(play(early, 'a', 'r2')).race).toBeNull();
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
