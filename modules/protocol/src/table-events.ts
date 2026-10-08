import type { Card } from './cards.js';
import type { EmoteLine, PlayEvent } from './round.js';
import type { FeedItem, GameSnapshot, HandSnapshot, MemberSnapshot, TableReactionEvent } from './table.js';
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

// What just happened at the table, in order, for everyone (spec §10.4).
export interface TablePlayEvent {
  events: PlayEvent[];
}

// The challenged hand, to the challenger alone (spec §5.5).
export interface TablePeekEvent {
  seat: string;
  cards: Card[];
}

// Someone's pointer over a card in their hand: its place in the hand, never the card (spec §8).
export interface TableHoverEvent {
  seat: string;
  index: number | null;
}

export interface TableEmoteEvent {
  seat: string;
  line: EmoteLine;
}

export interface TableEvents {
  view: TableViewEvent;
  // Your own cards, to you alone, whenever they change (D13).
  hand: HandSnapshot;
  play: TablePlayEvent;
  peek: TablePeekEvent;
  hover: TableHoverEvent;
  emote: TableEmoteEvent;
  feed: TableFeedEvent;
  reaction: TableReactionEvent;
  error: TableErrorEvent;
}
