import { defaultGameSettings, type TableEvents } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomFeed } from './feed.js';
import { TableRoomOutbox } from './outbox.js';
import type { TableRoomView } from './view.js';

interface Sent {
  to: string;
  type: keyof TableEvents;
}

interface Harness {
  outbox: TableRoomOutbox;
  feed: TableRoomFeed;
  sent: Sent[];
  state: { turnSeconds: number };
}

const ana = { id: 'a', name: 'Ana', color: 'sky' } as const;

const createOutbox = (): Harness => {
  const sent: Sent[] = [];
  const state: Harness['state'] = { turnSeconds: 20 };
  let lines = 0;
  const feed = new TableRoomFeed({ now: () => 0, createId: () => `line-${++lines}`, maxItems: 50 });

  const outbox = new TableRoomOutbox({
    feed,
    view: () => ({ members: [], game: { phase: 'lobby', settings: { ...defaultGameSettings, turnSeconds: state.turnSeconds }, match: null } }) satisfies TableRoomView,
    hand: () => null,
    drainPlayed: () => [],
    drainPeeks: () => [],
    now: () => 0,
    send: (to, type) => sent.push({ to, type }),
    broadcast: (type) => sent.push({ to: '*', type }),
  });

  return { outbox, feed, sent, state };
};

test('sync sends one browser everything it may see', () => {
  const { outbox, sent } = createOutbox();

  outbox.sync('a');

  expect(sent).toEqual([
    { to: 'a', type: 'view' },
    { to: 'a', type: 'feed' },
  ]);
});

test('flush sends the view only when it changed, and new feed lines only to synced browsers', () => {
  const { outbox, feed, sent, state } = createOutbox();

  outbox.flush();
  outbox.flush();
  expect(sent).toEqual([{ to: '*', type: 'view' }]);

  outbox.sync('a');
  sent.length = 0;
  feed.message(ana, 'hello');
  state.turnSeconds = 30;
  outbox.flush();

  expect(sent).toEqual([
    { to: '*', type: 'view' },
    { to: 'a', type: 'feed' },
  ]);
});

test('nothing personal goes out after forget', () => {
  const { outbox, feed, sent } = createOutbox();

  outbox.sync('a');
  outbox.flush();
  outbox.forget('a');
  sent.length = 0;
  feed.message(ana, 'anyone there?');
  outbox.flush();

  expect(sent).toEqual([]);
});
