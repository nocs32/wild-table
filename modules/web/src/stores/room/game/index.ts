import type { GamePhase, GameSnapshot } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';
import { RoomGameSettingsStore } from './settings';

export interface RoomGameDeps {
  t: Translate;
  send: TableSend;
}

// The game as you see it: its phase (the state) and the settings. The table runs the game; this
// only asks. For now there is only the lobby: rounds and the podium come with the game itself.
export class RoomGameStore {
  state: GamePhase = 'lobby';
  readonly settings: RoomGameSettingsStore;

  constructor(deps: RoomGameDeps) {
    this.settings = new RoomGameSettingsStore({ t: deps.t, send: deps.send, isEditable: () => this.state === 'lobby' });
    makeAutoObservable(this, {}, { autoBind: true });
  }

  receive(game: GameSnapshot): void {
    this.state = game.phase;
    this.settings.receive(game.settings);
  }
}
