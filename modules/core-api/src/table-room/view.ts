import type { GameSnapshot, MemberSnapshot } from '@wild-table/protocol';
import type { TableRoomGame } from './game.js';
import type { TableRoomMember } from './members.js';

// What the table looks like from outside: the shared view, the same for everyone. Hands will go
// only to their owner (spec D13, §10.4), never through here.

export interface TableRoomView {
  members: MemberSnapshot[];
  game: GameSnapshot;
}

export const tableView = (members: readonly TableRoomMember[], game: TableRoomGame): TableRoomView => ({
  members: members.map(({ id, name, color, connected, bot }) => ({ id, name, color, connected, bot })),
  game: { phase: game.phase, settings: game.settings },
});
