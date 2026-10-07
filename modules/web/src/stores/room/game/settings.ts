import { gameLimits, type GameSettings } from '@wild-table/protocol';
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

// The lobby's settings card (spec §5.8). Values come from the table; a slider shows where you drag
// at once and sends when you let go. Anyone at the table may change them.
export class RoomGameSettingsStore {
  state: RoomGameSettingsState = 'idle';
  targetScore = 0;
  turnSeconds = 0;
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

  get targetScoreHint(): string {
    return this.#deps.t('lobby.targetScoreHint');
  }

  get turnTimeLabel(): string {
    return this.#deps.t('lobby.seconds', { count: this.turnSeconds });
  }

  get turnTimeHint(): string {
    return this.#deps.t('lobby.turnTimeHint');
  }

  receive(settings: GameSettings): void {
    if (this.state === 'dragging') return;

    this.targetScore = settings.targetScore;
    this.turnSeconds = settings.turnSeconds;
  }

  previewTargetScore(values: number[]): void {
    this.state = 'dragging';
    this.targetScore = values[0] ?? this.targetScore;
  }

  previewTurnSeconds(values: number[]): void {
    this.state = 'dragging';
    this.turnSeconds = values[0] ?? this.turnSeconds;
  }

  commitSliders(): void {
    this.state = 'idle';
    this.#deps.send('updateSettings', { targetScore: this.targetScore, turnSeconds: this.turnSeconds });
  }
}
