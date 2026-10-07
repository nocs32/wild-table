import type { TableEvents } from '@wild-table/protocol';
import type { TableRoomFeed } from './feed.js';
import type { TableRoomView } from './view.js';

type TableRoomOutboxSend = <K extends keyof TableEvents>(memberId: string, type: K, message: TableEvents[K]) => void;

export interface TableRoomOutboxDeps {
  feed: TableRoomFeed;
  // The shared part of the table, the same for everyone.
  view: () => TableRoomView;
  now: () => number;
  send: TableRoomOutboxSend;
  broadcast: <K extends keyof TableEvents>(type: K, message: TableEvents[K]) => void;
}

// What one browser has been sent so far.
interface TableRoomOutboxSeen {
  feedSeq: number;
}

// What goes out after every change (spec §10.4): the shared view to everyone when it changed, and
// to each browser the feed lines it hasn't had. A browser gets nothing personal until it asks with
// `sync`, so it's listening by then. Each person's hand will go out the same way, to them alone.
export class TableRoomOutbox {
  #view = '';
  readonly #seen = new Map<string, TableRoomOutboxSeen>();
  readonly #deps: TableRoomOutboxDeps;

  constructor(deps: TableRoomOutboxDeps) {
    this.#deps = deps;
  }

  // Everything again, for a browser that just joined or reconnected: the table and the chat.
  sync(memberId: string): void {
    const { feed, send } = this.#deps;

    send(memberId, 'view', { now: this.#deps.now(), ...this.#deps.view() });
    send(memberId, 'feed', { reset: true, items: feed.items });
    this.#seen.set(memberId, { feedSeq: feed.seq });
  }

  // Their connection dropped or they left: nothing personal until they sync again.
  forget(memberId: string): void {
    this.#seen.delete(memberId);
  }

  flush(): void {
    const view = this.#deps.view();
    const text = JSON.stringify(view);

    if (text !== this.#view) {
      this.#view = text;
      this.#deps.broadcast('view', { now: this.#deps.now(), ...view });
    }

    this.#seen.forEach((seen, memberId) => this.#flushPersonal(memberId, seen));
  }

  dispose(): void {
    this.#seen.clear();
  }

  #flushPersonal(memberId: string, seen: TableRoomOutboxSeen): void {
    const { feed, send } = this.#deps;
    const items = feed.since(seen.feedSeq);

    if (items.length > 0) send(memberId, 'feed', { reset: false, items });

    this.#seen.set(memberId, { feedSeq: feed.seq });
  }
}
