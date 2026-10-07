import { applySettings, changedSettings } from '@wild-table/engine';
import { defaultGameSettings, type GamePhase, type GameSettings } from '@wild-table/protocol';
import { TableRoomError } from './error.js';
import type { TableRoomFeed } from './feed.js';
import type { TableRoomMembers } from './members.js';

export interface TableRoomGameDeps {
  members: TableRoomMembers;
  feed: TableRoomFeed;
}

// The game's states and settings. For now there is only the lobby: rounds, the round's end and
// the podium come with the game itself (spec §10.3), and so do its parts: the cards, the races
// and the bots.
export class TableRoomGame {
  phase: GamePhase = 'lobby';
  settings: GameSettings = { ...defaultGameSettings };
  readonly #deps: TableRoomGameDeps;

  constructor(deps: TableRoomGameDeps) {
    this.#deps = deps;
  }

  // Anyone may change the settings in the lobby (spec D15); each change gets a feed line.
  updateSettings(memberId: string, patch: Partial<GameSettings>): void {
    const author = this.#deps.members.get(memberId);

    if (this.phase !== 'lobby') throw new TableRoomError('WRONG_PHASE');

    const next = applySettings(this.settings, patch);

    changedSettings(this.settings, next).forEach((setting) => this.#deps.feed.system(author, { type: 'setting', setting, value: next[setting] }));
    this.settings = next;
  }
}
