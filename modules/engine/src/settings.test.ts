import { defaultGameSettings } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { pickBotName } from './bot-names.js';
import { applySettings, settingChanges } from './settings.js';

test('numbers are clamped and rounded to their steps', () => {
  const settings = applySettings(defaultGameSettings, { targetScore: 333, turnSeconds: 23, handSize: 12 });

  expect([settings.targetScore, settings.turnSeconds, settings.handSize]).toEqual([350, 25, 10]);
  expect(applySettings(defaultGameSettings, { targetScore: 0, turnSeconds: 5000, handSize: 0 })).toMatchObject({ targetScore: 100, turnSeconds: 40, handSize: 5 });
});

test('a patch changes only what it names, house rules included', () => {
  expect(applySettings(defaultGameSettings, { turnSeconds: 30 })).toEqual({ ...defaultGameSettings, turnSeconds: 30 });
  expect(applySettings(defaultGameSettings, {})).toEqual(defaultGameSettings);

  expect(applySettings(defaultGameSettings, { houseRules: { jumpIn: true } }).houseRules).toEqual({ ...defaultGameSettings.houseRules, jumpIn: true });
});

test('changes are listed in a fixed order: numbers, then house rules', () => {
  const after = applySettings(defaultGameSettings, { houseRules: { wild4AnyTime: true, stacking: true }, turnSeconds: 10, targetScore: 500 });

  expect(settingChanges(defaultGameSettings, after)).toEqual([
    { type: 'setting', setting: 'targetScore', value: 500 },
    { type: 'setting', setting: 'turnSeconds', value: 10 },
    { type: 'houseRule', rule: 'stacking', on: true },
    { type: 'houseRule', rule: 'wild4AnyTime', on: true },
  ]);

  expect(settingChanges(after, after)).toEqual([]);
});

test('bots get the first free name, then a numbered one', () => {
  expect(pickBotName(new Set())).toBe('Ace');
  expect(pickBotName(new Set(['Ace', 'Chip']))).toBe('Dice');
  expect(pickBotName(new Set(['Ace', 'Chip', 'Dice', 'Domino', 'Jinx', 'Lucky', 'Rook', 'Sparky', 'Trixie', 'Wiggles', 'Ace 2']))).toBe('Ace 3');
});
