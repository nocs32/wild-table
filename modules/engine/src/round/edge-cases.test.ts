import { expect, test } from 'vitest';
import { botJumpInDelay } from '../bots.js';
import { heldByBeat, stepMinMs, turnClockMs } from './clock.js';
import { roundSnapshot } from './public.js';
import { after, makeRound, move, play } from './test-round.js';
import { legalMoves, seatView } from './view.js';

test('a reshuffle while a Wild waits for its colour doesn’t make it look like the opening card', () => {
  // The deck is empty: catching a on their Wild makes them draw 2, and the pile goes back in.
  const start = { ...makeRound({ hands: { a: ['W', 'r2', 'b3'], b: ['y1', 'y2'], c: ['g1', 'g2'] }, top: 'r7', deck: [] }) };
  const picking = after(play(start, 'a', 'W'));
  const caught = after(move({ ...picking, race: 'a' }, 'b', { type: 'bell' }));

  expect(caught.pile.length).toBe(1);

  const picked = after(move(caught, 'a', { type: 'pickColour', colour: 'blue' }));

  expect([picked.turn, picked.step.kind]).toEqual(['b', 'play']);
});

test('a +4 remembers the colour it was played on and the hand it was played from', () => {
  const played = after(play(makeRound({ hands: { a: ['W4', 'r2', 'b3'], b: ['y1', 'y2'] }, top: 'r7' }), 'a', 'W4'));
  const answering = after(move(played, 'a', { type: 'pickColour', colour: 'blue' }));

  expect(answering.colour).toBe('blue');
  expect(roundSnapshot(answering, 0).challengeColour).toBe('red');

  const challenged = move(answering, 'b', { type: 'challenge' });
  const event = challenged.ok ? challenged.events.find((one) => one.type === 'challenged') : null;

  expect(event?.type === 'challenged' && event.hand.map((one) => one.id.split('#')[0])).toEqual(['r2', 'b3']);
  expect(event?.type === 'challenged' && event.bluff).toBe(true);
});

test('7-0: whoever ends up holding one card is in the Last card! race', () => {
  const rules = { sevenZero: true };
  const seven = after(play(makeRound({ hands: { a: ['r7', 'b1'], b: ['y1', 'y2', 'y3'], c: ['g1', 'g2'] }, top: 'r5', rules }), 'a', 'r7'));

  expect(seven.race).toBe('a');

  const swapped = after(move(seven, 'a', { type: 'swap', target: 'b' }));

  expect([swapped.hands.a?.length, swapped.hands.b?.length, swapped.race]).toEqual([3, 1, 'b']);

  const zero = after(play(makeRound({ hands: { a: ['r0', 'b1'], b: ['y1', 'y2'], c: ['g1', 'g2', 'g3'] }, top: 'r5', rules }), 'a', 'r0'));

  expect([zero.hands.b?.length, zero.race]).toEqual([1, 'b']);
});

test('the clock: a new turn gets the whole time, a new step keeps what’s left (at least 8 s), a bell nothing', () => {
  const times = { turnMs: 20_000, leftMs: 3000, beatMs: 1500 };

  expect(turnClockMs([{ type: 'turn', seat: 'b' }], false, times)).toBe(21_500);
  expect(turnClockMs([{ type: 'kept', seat: 'a' }], false, { ...times, leftMs: 12_000 })).toBe(12_000);
  expect(turnClockMs([], false, times)).toBe(stepMinMs);
  expect(turnClockMs([], true, times)).toBeNull();
});

test('the race’s beat holds back every play but the racer’s, and the next player’s draw', () => {
  const racing = { ...makeRound({ hands: { a: ['r2'], b: ['y1', 'y2'], c: ['r2'] }, top: 'r2', turn: 'b' }), race: 'a' };

  expect(heldByBeat(racing, 'c', { type: 'play', cardId: 'x' })).toBe(true);
  expect(heldByBeat(racing, 'b', { type: 'draw' })).toBe(true);
  expect(heldByBeat(racing, 'a', { type: 'play', cardId: 'x' })).toBe(false);
  expect(heldByBeat({ ...racing, race: null }, 'b', { type: 'draw' })).toBe(false);
});

test('bots jump in out of turn with the exact card on top, and only then', () => {
  const state = makeRound({ hands: { a: ['b4'], b: ['y1', 'y2'], c: ['r7', 'g2'] }, top: 'r7', turn: 'a', rules: { jumpIn: true } });
  const always = (): number => 0;

  expect(botJumpInDelay(seatView(state, 'c'), legalMoves(state, 'c'), always)).toBe(700);
  expect(botJumpInDelay(seatView(state, 'b'), legalMoves(state, 'b'), always)).toBeNull();
  expect(botJumpInDelay(seatView(state, 'a'), legalMoves(state, 'a'), always)).toBeNull();
});
