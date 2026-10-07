import type { FeedItem, GameSnapshot, MemberSnapshot, TableReactionEvent } from './table.js';
import type { TableErrorEvent } from './table-errors.js';

// Server → client events of the live table. The web app's table client turns them back into the
// snapshots the stores read, the same shapes the demo table sends (spec D18).

// The shared part of the table, the same for everyone. `now` is the server's clock, so browsers
// can turn server times into their own.
export interface TableViewEvent {
  now: number;
  members: MemberSnapshot[];
  game: GameSnapshot;
}

// New feed lines, or (`reset`) all of them, after joining or reconnecting.
export interface TableFeedEvent {
  reset: boolean;
  items: FeedItem[];
}

export interface TableEvents {
  view: TableViewEvent;
  feed: TableFeedEvent;
  reaction: TableReactionEvent;
  error: TableErrorEvent;
}
