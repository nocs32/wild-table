import { defaultGameSettings } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { applySettings, changedSettings } from './settings.js';

test('numbers are clamped and rounded to their steps', () => {
  const settings = applySettings(defaultGameSettings, { targetScore: 333, turnSeconds: 23 });

  expect([settings.targetScore, settings.turnSeconds]).toEqual([350, 25]);
  expect(applySettings(defaultGameSettings, { targetScore: 0, turnSeconds: 5000 })).toEqual({ targetScore: 100, turnSeconds: 40 });
});

test('a patch changes only what it names', () => {
  expect(applySettings(defaultGameSettings, { turnSeconds: 30 })).toEqual({ ...defaultGameSettings, turnSeconds: 30 });
  expect(applySettings(defaultGameSettings, {})).toEqual(defaultGameSettings);
});

test('changes are listed in a fixed order', () => {
  const after = applySettings(defaultGameSettings, { turnSeconds: 10, targetScore: 500 });

  expect(changedSettings(defaultGameSettings, after)).toEqual(['targetScore', 'turnSeconds']);
  expect(changedSettings(after, after)).toEqual([]);
});
