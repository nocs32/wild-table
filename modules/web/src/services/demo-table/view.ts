import type { HandSnapshot, MatchSnapshot, TableSnapshot } from '@wild-table/protocol';
import type { DemoFeed } from './feed';
import type { DemoTableState } from './types';

// The table as you see it: who's here, the game and the match, your own hand, and the chat.
export const snapshotFor = (table: DemoTableState, feed: DemoFeed, match: MatchSnapshot | null, hand: HandSnapshot | null): TableSnapshot => ({
  members: table.members.map(({ id, name, color, connected, bot }) => ({ id, name, color, connected, bot })),
  game: { phase: table.phase, settings: table.settings, match },
  hand,
  feed: feed.items,
});
