// The table's settings (spec §5.7, §5.8): a change from anyone at the table, kept within the limits.
import { gameLimits, houseRules, type GameSettingKey, type GameSettings, type GameSettingsPatch, type HouseRule } from '@wild-table/protocol';

interface Range {
  min: number;
  max: number;
  step?: number;
}

const clamp = (value: number, { min, max, step = 1 }: Range): number => Math.min(max, Math.max(min, Math.round(value / step) * step));

export const applySettings = (current: GameSettings, patch: GameSettingsPatch): GameSettings => ({
  targetScore: clamp(patch.targetScore ?? current.targetScore, gameLimits.targetScore),
  turnSeconds: clamp(patch.turnSeconds ?? current.turnSeconds, gameLimits.turnSeconds),
  handSize: clamp(patch.handSize ?? current.handSize, gameLimits.handSize),
  houseRules: { ...current.houseRules, ...patch.houseRules },
});

// One change, as the feed line that announces it.
export type SettingChange = { type: 'setting'; setting: GameSettingKey; value: number } | { type: 'houseRule'; rule: HouseRule; on: boolean };

const numberKeys: readonly GameSettingKey[] = ['targetScore', 'turnSeconds', 'handSize'];

// What differs, in a fixed order: the numbers, then the house rules (one feed line each).
export const settingChanges = (before: GameSettings, after: GameSettings): SettingChange[] => [
  ...numberKeys.filter((key) => before[key] !== after[key]).map((setting): SettingChange => ({ type: 'setting', setting, value: after[setting] })),
  ...houseRules.filter((rule) => before.houseRules[rule] !== after.houseRules[rule]).map((rule): SettingChange => ({ type: 'houseRule', rule, on: after.houseRules[rule] })),
];
