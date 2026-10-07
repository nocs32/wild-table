// The table's settings (spec §5.8): a change from anyone at the table, kept within the limits.
import { gameLimits, type GameSettingKey, type GameSettings } from '@wild-table/protocol';

interface Range {
  min: number;
  max: number;
  step?: number;
}

const clamp = (value: number, { min, max, step = 1 }: Range): number => Math.min(max, Math.max(min, Math.round(value / step) * step));

export const applySettings = (current: GameSettings, patch: Partial<GameSettings>): GameSettings => ({
  targetScore: clamp(patch.targetScore ?? current.targetScore, gameLimits.targetScore),
  turnSeconds: clamp(patch.turnSeconds ?? current.turnSeconds, gameLimits.turnSeconds),
});

const settingKeys: readonly GameSettingKey[] = ['targetScore', 'turnSeconds'];

// Which settings differ, in a fixed order (one feed line each).
export const changedSettings = (before: GameSettings, after: GameSettings): GameSettingKey[] => settingKeys.filter((key) => before[key] !== after[key]);
