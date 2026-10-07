import { chatMaxLength, type FeedEvent, type FeedItem } from '@wild-table/protocol';

// Who wrote a line: their name and colour are kept with it, for when they've left.
export interface TableRoomFeedAuthor {
  id: string;
  name: string;
  color: FeedItem['authorColor'];
}

export interface TableRoomFeedDeps {
  now: () => number;
  createId: () => string;
  maxItems: number;
}

interface TableRoomFeedEntry {
  // Counts up, so each browser can be sent just the lines it hasn't had.
  seq: number;
  item: FeedItem;
}

// The chat and system lines (spec §7). Everyone sees every line: nothing in the chat is secret here.
export class TableRoomFeed {
  #entries: TableRoomFeedEntry[] = [];
  #seq = 0;
  readonly #deps: TableRoomFeedDeps;

  constructor(deps: TableRoomFeedDeps) {
    this.#deps = deps;
  }

  // The newest line's number (0 before the first).
  get seq(): number {
    return this.#seq;
  }

  get items(): FeedItem[] {
    return this.since(0);
  }

  system(author: TableRoomFeedAuthor, event: FeedEvent): void {
    this.#add({ ...this.#base(author), kind: 'system', event });
  }

  // A chat line, trimmed; an empty one is dropped.
  message(author: TableRoomFeedAuthor, text: string): void {
    const clean = text.trim().slice(0, chatMaxLength);

    if (clean) this.#add({ ...this.#base(author), kind: 'message', text: clean });
  }

  // Lines after `seq`.
  since(seq: number): FeedItem[] {
    return this.#entries.filter((entry) => entry.seq > seq).map((entry) => entry.item);
  }

  #base(author: TableRoomFeedAuthor): Pick<FeedItem, 'id' | 'authorId' | 'authorName' | 'authorColor' | 'at'> {
    return { id: this.#deps.createId(), authorId: author.id, authorName: author.name, authorColor: author.color, at: this.#deps.now() };
  }

  #add(item: FeedItem): void {
    this.#seq += 1;
    this.#entries = [...this.#entries, { seq: this.#seq, item }].slice(-this.#deps.maxItems);
  }
}
