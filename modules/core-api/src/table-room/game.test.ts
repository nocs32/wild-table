import { botMove, createRandom } from '@wild-table/engine';
import { defaultGameSettings } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { createTestGame, type TestGame } from './test-table.js';
import { tableView } from './view.js';

const systemLines = ({ feed }: TestGame): unknown[] => feed.items.map((item) => (item.kind === 'system' ? item.event : null));

// Everyone plays as the planning bot would, through the game's own moves, until the round ends.
const playOut = (table: TestGame): void => {
  const random = createRandom(5);
  const { game, cards } = table;

  for (let guard = 0; guard < 3000 && game.phase === 'round'; guard++) {
    const round = cards.round;

    if (!round) return;

    game.move(round.turn, botMove('planner', cards.view(round.turn), cards.legal(round.turn), random) ?? { type: 'draw' }, 0.5);
  }
};

test('a new table waits in the lobby with the default settings', () => {
  const { game, members, cards, clock, timers } = createTestGame(2);

  expect(tableView({ members: members.all, game, cards, clock, now: timers.now }).game).toEqual({ phase: 'lobby', settings: defaultGameSettings, match: null });
});

test('anyone may change the settings; each change is clamped and gets a feed line', () => {
  const table = createTestGame(2);

  table.game.updateSettings('p1', { targetScore: 520, turnSeconds: 7, houseRules: { jumpIn: true } });

  expect(table.game.settings).toEqual({ ...defaultGameSettings, targetScore: 500, turnSeconds: 10, houseRules: { ...defaultGameSettings.houseRules, jumpIn: true } });

  expect(systemLines(table)).toEqual([
    { type: 'setting', setting: 'targetScore', value: 500 },
    { type: 'setting', setting: 'turnSeconds', value: 10 },
    { type: 'houseRule', rule: 'jumpIn', on: true },
  ]);
});

test('Start needs two seats; it deals everyone in and says so in the chat', () => {
  const alone = createTestGame(1);

  expect(() => alone.game.start('p0')).toThrow(new TableRoomError('NOT_ENOUGH_PLAYERS'));

  const table = createTestGame(3);

  table.game.start('p1');

  expect(table.game.phase).toBe('round');
  expect(['p0', 'p1', 'p2'].every((seat) => (table.cards.hand(seat)?.cards.length ?? 0) >= 7)).toBe(true);
  expect(systemLines(table)).toEqual([{ type: 'matchStarted' }]);
  expect(table.game.drainPlayed()[0]).toMatchObject({ type: 'dealt', handSize: 7 });
  expect(() => table.game.updateSettings('p0', { turnSeconds: 30 })).toThrow(new TableRoomError('WRONG_PHASE'));
});

test('moves are checked against the rules, and people watching can’t play', () => {
  const table = createTestGame(3);

  table.game.start('p0');

  const turn = table.cards.round?.turn ?? '';
  const other = ['p0', 'p1', 'p2'].find((seat) => seat !== turn) ?? '';

  expect(() => table.game.move(other, { type: 'draw' }, 0)).toThrow(new TableRoomError('NOT_YOUR_TURN'));
  expect(() => table.game.move(turn, { type: 'play', cardId: 'nope' }, 0)).toThrow(new TableRoomError('NOT_IN_HAND'));

  table.members.join('late', 'Late');
  expect(() => table.game.move('late', { type: 'draw' }, 0)).toThrow(new TableRoomError('NOT_PLAYING'));
});

test('out of time: the turn passes; twice in a row and a bot plays the seat until its person is back', () => {
  const table = createTestGame(2);

  table.game.start('p0');

  const sleepy = table.cards.round?.turn ?? '';

  table.game.drainPlayed();
  table.timers.advance(20_000);
  expect(table.game.drainPlayed()[0]).toEqual(expect.objectContaining({ type: 'timedOut', seat: sleepy }));
  expect(table.game.match.standIns.has(sleepy)).toBe(false);

  table.game.match.timedOut(sleepy);
  expect(table.game.match.standIns.has(sleepy)).toBe(true);

  table.game.match.acted(sleepy);
  expect(table.game.match.standIns.has(sleepy)).toBe(false);
});

test('a match: the winner scores, the next round comes after the pause, the podium at the target, then Play again', () => {
  const table = createTestGame(2);

  table.game.updateSettings('p0', { targetScore: 100 });
  table.game.start('p0');
  playOut(table);
  expect(['roundOver', 'podium']).toContain(table.game.phase);
  expect([...table.game.match.scores.values()].some((score) => score > 0)).toBe(true);

  for (let round = 0; round < 50 && table.game.phase !== 'podium'; round++) {
    table.timers.advance(10_000);
    expect(table.game.phase).toBe('round');
    playOut(table);
  }

  expect(table.game.phase).toBe('podium');
  expect(table.game.match.champion).not.toBeNull();
  expect(systemLines(table).at(-1)).toMatchObject({ type: 'matchWon' });

  table.game.playAgain('p1');
  expect([table.game.phase, table.game.match.scores.size]).toEqual(['lobby', 0]);
});

test('someone who leaves mid-round has a bot play their seat; the next round deals them out', () => {
  const table = createTestGame(3);

  table.game.start('p0');
  table.members.leave('p2');
  table.game.leave('p2');
  expect(table.game.match.standIns.has('p2')).toBe(true);

  playOut(table);

  if (table.game.phase === 'roundOver') {
    table.timers.advance(10_000);
    expect(table.game.match.seats).toEqual(['p0', 'p1']);
  }
});

test('a bot plays its own turns, and stands in for a person who keeps running out of time', () => {
  const table = createTestGame(1);

  table.bots.add('p0');
  table.game.updateSettings('p0', { targetScore: 100 });
  table.game.start('p0');
  table.bots.drive();
  table.timers.advance(60 * 60_000);

  expect(table.game.phase).toBe('podium');
  expect(table.game.match.standIns.has('p0')).toBe(true);
});
