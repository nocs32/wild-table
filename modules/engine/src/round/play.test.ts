import { expect, test } from 'vitest';
import { after, codesOf, makeRound, move, play } from './test-round.js';

const three = { a: ['r2', 'b7', 'gS'], b: ['y1', 'y2', 'y3'], c: ['g1', 'g2', 'g3'] };

test('a card that fits goes on the pile and the turn moves on', () => {
  const state = after(play(makeRound({ hands: three, top: 'r7' }), 'a', 'r2'));

  expect(state.pile.at(-1)?.id).toMatch(/^r2#/u);
  expect(codesOf(state, 'a')).toEqual(['b7', 'gS']);
  expect([state.turn, state.colour]).toEqual(['b', 'red']);
});

test('refused: out of turn, not in hand, or not fitting', () => {
  const state = makeRound({ hands: three, top: 'r7' });

  expect(play(state, 'b', 'y1')).toEqual({ ok: false, error: 'NOT_YOUR_TURN' });
  expect(play(state, 'a', 'y9')).toEqual({ ok: false, error: 'NOT_IN_HAND' });
  expect(play(state, 'a', 'gS')).toEqual({ ok: false, error: 'DOES_NOT_FIT' });
});

test('Skip skips the next player; Reverse turns play round', () => {
  expect(after(play(makeRound({ hands: { ...three, a: ['rS', 'r1'] }, top: 'r7' }), 'a', 'rS')).turn).toBe('c');

  const reversed = after(play(makeRound({ hands: { ...three, a: ['rR', 'r1'] }, top: 'r7' }), 'a', 'rR'));

  expect([reversed.direction, reversed.turn]).toEqual([-1, 'c']);
});

test('with two players, Reverse works like a Skip', () => {
  const state = after(play(makeRound({ hands: { a: ['rR', 'r1'], b: ['y1'] }, top: 'r7' }), 'a', 'rR'));

  expect(state.turn).toBe('a');
});

test('+2: the next player draws 2 and misses their turn', () => {
  const state = after(play(makeRound({ hands: { ...three, a: ['r+', 'r1'] }, top: 'r7' }), 'a', 'r+'));

  expect(state.hands.b).toHaveLength(5);
  expect(state.turn).toBe('c');
});

test('a Wild asks for a colour, then the turn moves on', () => {
  const picking = after(play(makeRound({ hands: { ...three, a: ['W', 'r1'] }, top: 'g7' }), 'a', 'W'));

  expect([picking.turn, picking.step]).toEqual(['a', { kind: 'pickColour' }]);

  const picked = after(move(picking, 'a', { type: 'pickColour', colour: 'yellow' }));

  expect([picked.turn, picked.colour]).toEqual(['b', 'yellow']);
});

test('Wild +4: the next player takes 4, or challenges', () => {
  const fair = after(move(after(play(makeRound({ hands: { ...three, a: ['W4', 'b1'] }, top: 'g7' }), 'a', 'W4')), 'a', { type: 'pickColour', colour: 'blue' }));

  expect([fair.turn, fair.step.kind, fair.pendingDraw]).toEqual(['b', 'answer', 4]);

  const taken = after(move(fair, 'b', { type: 'take' }));

  expect([taken.hands.b?.length, taken.turn]).toEqual([7, 'c']);

  const challenged = after(move(fair, 'b', { type: 'challenge' }));

  expect([challenged.hands.b?.length, challenged.turn]).toEqual([9, 'c']);
});

test('a +4 bluff, challenged: the bluffer draws the 4 and the challenger plays', () => {
  const bluffed = after(move(after(play(makeRound({ hands: { ...three, a: ['W4', 'g1'] }, top: 'g7' }), 'a', 'W4')), 'a', { type: 'pickColour', colour: 'yellow' }));
  const result = move(bluffed, 'b', { type: 'challenge' });
  const state = after(result);

  expect([state.hands.a?.length, state.hands.b?.length, state.turn, state.step.kind]).toEqual([5, 3, 'b', 'play']);
  expect(result.ok && result.events[0]).toMatchObject({ type: 'challenged', seat: 'b', against: 'a', bluff: true, hand: [expect.objectContaining({ kind: 'number', colour: 'green' })] });
});

test('drawing: a card that fits can be played or kept; one that doesn’t ends the turn', () => {
  const drew = after(move(makeRound({ hands: three, top: 'r7', deck: ['b1', 'r3'] }), 'a', { type: 'draw' }));

  expect(drew.step).toEqual({ kind: 'drawn', cardId: expect.stringMatching(/^r3#/u) });
  expect(after(move(drew, 'a', { type: 'keep' })).turn).toBe('b');
  expect(after(play(drew, 'a', 'r3')).turn).toBe('b');
  expect(play(drew, 'a', 'r2')).toEqual({ ok: false, error: 'WRONG_STEP' });

  const missed = after(move(makeRound({ hands: three, top: 'r7', deck: ['b1', 'y3'] }), 'a', { type: 'draw' }));

  expect([missed.turn, codesOf(missed, 'a')]).toEqual(['b', ['r2', 'b7', 'gS', 'y3']]);
});

test('an empty deck is refilled from the pile, all but its top card', () => {
  const result = move({ ...makeRound({ hands: three, top: 'r7' }), deck: [] }, 'a', { type: 'draw' });
  const state = after(result);

  expect(result.ok && result.events.map((event) => event.type)).toEqual(['reshuffled', 'drew', 'turn']);
  expect(state.pile.map((one) => one.id.split('#')[0])).toEqual(['r7']);
  expect(state.deck).toHaveLength(0);
});

test('the last card wins the round, scoring the other hands', () => {
  const result = play(makeRound({ hands: { a: ['r2'], b: ['y1', 'W'], c: ['gS', 'g9'] }, top: 'r7' }), 'a', 'r2');

  expect(after(result).winner).toBe('a');
  expect(result.ok && result.events.at(-1)).toEqual({ type: 'roundOver', winner: 'a', points: 1 + 50 + 20 + 9 });
});

test('a last +2 still makes the next player draw, and those cards count', () => {
  const result = play(makeRound({ hands: { a: ['r+'], b: ['y1'] }, top: 'r7', deck: ['b5', 'g6'] }), 'a', 'r+');

  expect(result.ok && result.events.at(-1)).toEqual({ type: 'roundOver', winner: 'a', points: 1 + 5 + 6 });
});
