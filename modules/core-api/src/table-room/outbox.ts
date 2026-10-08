import type { HandSnapshot, PlayEvent, TableEvents } from '@wild-table/protocol';
import type { TableRoomFeed } from './feed.js';
import type { TableRoomPeek } from './play-events.js';
import type { TableRoomView } from './view.js';

type TableRoomOutboxSend = <K extends keyof TableEvents>(memberId: string, type: K, message: TableEvents[K]) => void;

export interface TableRoomOutboxDeps {
  feed: TableRoomFeed;
  // The shared part of the table, the same for everyone.
  view: () => TableRoomView;
  // A person's own cards, or null when they aren't dealt in.
  hand: (memberId: string) => HandSnapshot | null;
  // What happened at the table since the last flush, and the private peeks that came with it.
  drainPlayed: () => PlayEvent[];
  drainPeeks: () => TableRoomPeek[];
  now: () => number;
  send: TableRoomOutboxSend;
  broadcast: <K extends keyof TableEvents>(type: K, message: TableEvents[K]) => void;
}

// What one browser has been sent so far.
interface TableRoomOutboxSeen {
  feedSeq: number;
  hand: string;
}

// What goes out after every change (spec §10.4): what just happened, to everyone; the shared view
// to everyone when it changed; and to each browser its own hand when it changed, its peek, and the
// feed lines it hasn't had. A browser gets nothing personal until it asks with `sync`, so it's
// listening by then. Nobody is ever sent another person's cards (D13).
export class TableRoomOutbox {
  #view = '';
  readonly #seen = new Map<string, TableRoomOutboxSeen>();
  readonly #deps: TableRoomOutboxDeps;

  constructor(deps: TableRoomOutboxDeps) {
    this.#deps = deps;
  }

  // Everything again, for a browser that just joined or reconnected: the table, their hand and the
  // chat.
  sync(memberId: string): void {
    const { feed, send } = this.#deps;
    const hand = this.#deps.hand(memberId);

    send(memberId, 'view', { now: this.#deps.now(), ...this.#deps.view() });

    if (hand) send(memberId, 'hand', hand);

    send(memberId, 'feed', { reset: true, items: feed.items });
    this.#seen.set(memberId, { feedSeq: feed.seq, hand: JSON.stringify(hand) });
  }

  // Their connection dropped or they left: nothing personal until they sync again.
  forget(memberId: string): void {
    this.#seen.delete(memberId);
  }

  flush(): void {
    const played = this.#deps.drainPlayed();
    const view = this.#deps.view();
    const text = JSON.stringify(view);

    if (played.length > 0) this.#deps.broadcast('play', { events: played });

    if (text !== this.#view) {
      this.#view = text;
      this.#deps.broadcast('view', { now: this.#deps.now(), ...view });
    }

    this.#deps.drainPeeks().forEach(({ to, event }) => {
      if (this.#seen.has(to)) this.#deps.send(to, 'peek', event);
    });

    this.#seen.forEach((seen, memberId) => this.#flushPersonal(memberId, seen));
  }

  dispose(): void {
    this.#seen.clear();
  }

  #flushPersonal(memberId: string, seen: TableRoomOutboxSeen): void {
    const { feed, send } = this.#deps;
    const items = feed.since(seen.feedSeq);
    const hand = this.#deps.hand(memberId);
    const handText = JSON.stringify(hand);

    if (hand && handText !== seen.hand) send(memberId, 'hand', hand);

    if (items.length > 0) send(memberId, 'feed', { reset: false, items });

    this.#seen.set(memberId, { feedSeq: feed.seq, hand: handText });
  }
}
