import { gameLimits } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../locale';
import type { PlayerView, RoomPresenceStore } from './presence';
import type { TableSend } from './types';

export interface RoomSeatsDeps {
  t: Translate;
  presence: RoomPresenceStore;
  send: TableSend;
  // Bots sit down and get up only in the lobby (spec §4.2).
  isLobby: () => boolean;
}

// A seat round the table: someone in it, or the free one where a bot can sit.
export interface SeatView {
  // The member's id, or 'free'.
  id: string;
  player: PlayerView | null;
  // Where it is round the table, in degrees: 0 is your own place at the near edge, 180 straight
  // across (spec §9: "1 across from you, 2 to the left and right, up to 5 in an arc").
  angle: number;
}

// Your place, and the arc across the table the others share.
const arc = { from: 70, to: 290 };

const spread = (index: number, count: number): number => arc.from + ((arc.to - arc.from) * (index + 0.5)) / count;

// Who sits where, the bots, and whether there are enough players to start. You always sit at the
// near edge; the others follow round the table in the order they sat down, and while there's room
// the next free seat waits among them.
export class RoomSeatsStore {
  readonly #deps: RoomSeatsDeps;

  constructor(deps: RoomSeatsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get taken(): number {
    return this.#deps.presence.count;
  }

  get max(): number {
    return gameLimits.maxPlayers;
  }

  get isFull(): boolean {
    return this.taken >= this.max;
  }

  // Start needs two seats filled, people or bots (spec §4.2).
  get isReady(): boolean {
    return this.taken >= gameLimits.minPlayers;
  }

  get canAddBot(): boolean {
    return this.#deps.isLobby() && !this.isFull;
  }

  get canRemoveBots(): boolean {
    return this.#deps.isLobby();
  }

  get bots(): PlayerView[] {
    return this.#deps.presence.bots;
  }

  get seats(): SeatView[] {
    const { views } = this.#deps.presence;
    const mine = views.findIndex((view) => view.isMe);
    const others = [...views.slice(mine + 1), ...views.slice(0, Math.max(0, mine))];
    const around: Array<PlayerView | null> = this.isFull ? others : [...others, null];
    const me = views[mine];

    return [
      ...(me ? [{ id: me.id, player: me, angle: 0 }] : []),
      ...around.map((player, index) => ({ id: player?.id ?? 'free', player, angle: spread(index, around.length) })),
    ];
  }

  get countLabel(): string {
    return this.#deps.t('lobby.seatsTaken', { taken: this.taken, max: this.max });
  }

  addBot(): void {
    if (this.canAddBot) this.#deps.send('addBot', {});
  }

  removeBot(id: string): void {
    if (this.canRemoveBots) this.#deps.send('removeBot', { memberId: id });
  }
}
