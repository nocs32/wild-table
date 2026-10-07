import type { TableSnapshot } from '@wild-table/protocol';
import type { DemoFeed } from './feed';
import type { DemoTableState } from './types';

// The table as everyone sees it: who's here, the game, and the chat.
export const snapshotFor = (table: DemoTableState, feed: DemoFeed): TableSnapshot => ({
  members: table.members.map(({ id, name, color, connected }) => ({ id, name, color, connected })),
  game: { phase: table.phase, settings: table.settings },
  feed: feed.items,
});
