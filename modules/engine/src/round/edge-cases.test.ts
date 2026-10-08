import { expect, test } from 'vitest';
import { botJumpInDelay, plannedMove } from '../bots.js';
import { stepMinMs, turnClockMs } from './clock.js';
import { roundSnapshot } from './public.js';
import { after, makeRound, move, play } from './test-round.js';
import { legalMoves, seatView } from './view.js';

test('a Wild picked down to a one-card pile isn’t taken for the opening card', () => {
  // After a reshuffle the pile can be just the Wild: picking still passes the turn on.
  const start = makeRound({ hands: { a: ['r2', 'b3'], b: ['y1', 'y2'], c: ['g1', 'g2'] }, top: 'W' });
  const picking = { ...start, pile: start.pile.slice(-1), step: { kind: 'pickColour', opening: false } as const };
  const picked = after(move(picking, 'a', { type: 'pickColour', colour: 'blue' }));

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

test('the clock: a new turn gets the whole time, a new step keeps what’s left, at least 8 s', () => {
  const times = { turnMs: 20_000, leftMs: 3000 };

  expect(turnClockMs([{ type: 'turn', seat: 'b' }], times)).toBe(20_000);
  expect(turnClockMs([{ type: 'kept', seat: 'a' }], { ...times, leftMs: 12_000 })).toBe(12_000);
  expect(turnClockMs([], times)).toBe(stepMinMs);
});

test('bots jump in out of turn with the exact card on top, and only then', () => {
  const state = makeRound({ hands: { a: ['b4'], b: ['y1', 'y2'], c: ['r7', 'g2'] }, top: 'r7', turn: 'a', rules: { jumpIn: true } });
  const always = (): number => 0;

  expect(botJumpInDelay(seatView(state, 'c'), legalMoves(state, 'c'), always)).toBe(700);
  expect(botJumpInDelay(seatView(state, 'b'), legalMoves(state, 'b'), always)).toBeNull();
  expect(botJumpInDelay(seatView(state, 'a'), legalMoves(state, 'a'), always)).toBeNull();
});

test('bots ring the bell when someone else is on one card, unless they can win instead', () => {
  const blocking = makeRound({ hands: { a: ['r2', 'b9'], b: ['y1'] }, top: 'r7' });
  const winning = makeRound({ hands: { a: ['r2'], b: ['y1'] }, top: 'r7' });
  const always = (): number => 0;

  expect(plannedMove(seatView(blocking, 'a'), legalMoves(blocking, 'a'), always)).toEqual({ type: 'bell' });
  expect(plannedMove(seatView(winning, 'a'), legalMoves(winning, 'a'), always)?.type).toBe('play');
});
