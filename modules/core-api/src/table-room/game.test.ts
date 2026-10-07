import { defaultGameSettings } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { createTestGame } from './test-table.js';
import { tableView } from './view.js';

test('a new table waits in the lobby with the default settings', () => {
  const { game, members } = createTestGame(2);

  expect(game.phase).toBe('lobby');
  expect(tableView(members.all, game).game).toEqual({ phase: 'lobby', settings: defaultGameSettings });
});

test('anyone may change the settings; each change is clamped and gets a feed line', () => {
  const { game, feed } = createTestGame(2);

  game.updateSettings('p1', { targetScore: 520, turnSeconds: 7 });

  expect(game.settings).toEqual({ targetScore: 500, turnSeconds: 10 });

  expect(feed.items.map((item) => (item.kind === 'system' ? item.event : null))).toEqual([
    { type: 'setting', setting: 'targetScore', value: 500 },
    { type: 'setting', setting: 'turnSeconds', value: 10 },
  ]);
});

test('a setting that ends up unchanged adds no feed line', () => {
  const { game, feed } = createTestGame(2);

  game.updateSettings('p0', { targetScore: defaultGameSettings.targetScore + 10 });

  expect(game.settings).toEqual(defaultGameSettings);
  expect(feed.items).toEqual([]);
});

test('only people at the table change the settings', () => {
  const { game } = createTestGame(1);

  expect(() => game.updateSettings('stranger', { turnSeconds: 30 })).toThrow(new TableRoomError('NOT_A_MEMBER'));
});

test('the view carries who is here and the game, nothing else', () => {
  const { game, members } = createTestGame(2);

  members.drop('p1');

  expect(tableView(members.all, game).members).toEqual([
    { id: 'p0', name: 'Player 0', color: expect.any(String), connected: true },
    { id: 'p1', name: 'Player 1', color: expect.any(String), connected: false },
  ]);
});
