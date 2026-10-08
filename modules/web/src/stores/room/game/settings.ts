import { defaultGameSettings, gameLimits, houseRules, type GameSettingKey, type GameSettings, type HouseRule, type HouseRules } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';

export interface RoomGameSettingsDeps {
  t: Translate;
  send: TableSend;
  // Settings change only in the lobby (spec D15).
  isEditable: () => boolean;
}

// idle → dragging (a slider is held: the table's values don't overwrite it).
export type RoomGameSettingsState = 'idle' | 'dragging';

// A house rule as the settings card and the rule book show it.
export interface HouseRuleView {
  rule: HouseRule;
  name: string;
  hint: string;
  on: boolean;
}

// A number setting as its slider shows it: what it's called, its value, and what it does.
export interface SettingSliderView {
  key: GameSettingKey;
  label: string;
  valueText: string;
  hint: string;
  value: number;
  range: { min: number; max: number; step: number };
  preview: (values: number[]) => void;
}

// The lobby's settings card (spec §5.7, §5.8). Values come from the table; a slider shows where you
// drag at once and sends when you let go, and a switch sends at once. Anyone at the table may
// change them.
export class RoomGameSettingsStore {
  state: RoomGameSettingsState = 'idle';
  targetScore = defaultGameSettings.targetScore;
  turnSeconds = defaultGameSettings.turnSeconds;
  handSize = defaultGameSettings.handSize;
  houseRules: HouseRules = { ...defaultGameSettings.houseRules };
  readonly limits = gameLimits;
  readonly #deps: RoomGameSettingsDeps;

  constructor(deps: RoomGameSettingsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { limits: false }, { autoBind: true });
  }

  get isEditable(): boolean {
    return this.#deps.isEditable();
  }

  get targetScoreLabel(): string {
    return this.#deps.t('lobby.points', { count: this.targetScore });
  }

  get turnTimeLabel(): string {
    return this.#deps.t('lobby.seconds', { count: this.turnSeconds });
  }

  get handSizeLabel(): string {
    return this.#deps.t('lobby.cards', { count: this.handSize });
  }

  // The match's three sliders: points to win, time per turn, cards to start with.
  get sliders(): SettingSliderView[] {
    const { t } = this.#deps;

    return [
      { key: 'targetScore', label: t('lobby.targetScore'), valueText: this.targetScoreLabel, hint: t('lobby.targetScoreHint'), value: this.targetScore, range: gameLimits.targetScore, preview: this.previewTargetScore },
      { key: 'turnSeconds', label: t('lobby.turnTime'), valueText: this.turnTimeLabel, hint: t('lobby.turnTimeHint'), value: this.turnSeconds, range: gameLimits.turnSeconds, preview: this.previewTurnSeconds },
      { key: 'handSize', label: t('lobby.handSize'), valueText: this.handSizeLabel, hint: t('lobby.handSizeHint'), value: this.handSize, range: gameLimits.handSize, preview: this.previewHandSize },
    ];
  }

  get houseRuleViews(): HouseRuleView[] {
    const { t } = this.#deps;

    return houseRules.map((rule) => ({ rule, name: t(`houseRules.${rule}.name`), hint: t(`houseRules.${rule}.hint`), on: this.houseRules[rule] }));
  }

  // The rules switched on, as the table's tent cards show them.
  get activeHouseRules(): HouseRuleView[] {
    return this.houseRuleViews.filter((view) => view.on);
  }

  get houseRulesOn(): HouseRule[] {
    return houseRules.filter((rule) => this.houseRules[rule]);
  }

  // "All off: the classic rules", or how many are on.
  get houseRulesSummary(): string {
    const count = this.houseRulesOn.length;

    return count === 0 ? this.#deps.t('lobby.houseRulesClassic') : this.#deps.t('lobby.houseRulesOn', { count });
  }

  receive(settings: GameSettings): void {
    this.houseRules = settings.houseRules;

    if (this.state === 'dragging') return;

    this.targetScore = settings.targetScore;
    this.turnSeconds = settings.turnSeconds;
    this.handSize = settings.handSize;
  }

  previewTargetScore(values: number[]): void {
    this.state = 'dragging';
    this.targetScore = values[0] ?? this.targetScore;
  }

  previewTurnSeconds(values: number[]): void {
    this.state = 'dragging';
    this.turnSeconds = values[0] ?? this.turnSeconds;
  }

  previewHandSize(values: number[]): void {
    this.state = 'dragging';
    this.handSize = values[0] ?? this.handSize;
  }

  commitSliders(): void {
    this.state = 'idle';
    this.#deps.send('updateSettings', { targetScore: this.targetScore, turnSeconds: this.turnSeconds, handSize: this.handSize });
  }

  // Shows the switch flipped at once; the table confirms it with everyone.
  setHouseRule(rule: HouseRule, on: boolean): void {
    const patch: Partial<HouseRules> = {};

    patch[rule] = on;
    this.houseRules = { ...this.houseRules, ...patch };
    this.#deps.send('updateSettings', { houseRules: patch });
  }
}
