import { createRandom } from '@wild-table/engine';
import { TableRoomBots } from './bots.js';
import { TableRoomCards } from './cards.js';
import { TableRoomClock } from './clock.js';
import { TableRoomFeed } from './feed.js';
import { TableRoomGame } from './game.js';
import type { Schedule } from './lifecycle.js';
import { TableRoomMembers } from './members.js';

// A clock the tests move by hand: timers run in order as time is advanced.
export interface TestTimers {
  schedule: Schedule;
  now: () => number;
  advance: (ms: number) => void;
}

export const createTestTimers = (): TestTimers => {
  let time = 0;
  let next = 0;
  let timers: Array<{ id: number; at: number; run: () => void }> = [];

  const schedule: Schedule = (run, delayMs) => {
    const id = next++;

    timers.push({ id, at: time + delayMs, run });

    return () => {
      timers = timers.filter((timer) => timer.id !== id);
    };
  };

  const nextDue = (end: number): { id: number; at: number; run: () => void } | undefined => timers.filter((timer) => timer.at <= end).sort((a, b) => a.at - b.at)[0];

  const advance = (ms: number): void => {
    const end = time + ms;
    let due = nextDue(end);

    while (due) {
      const timer = due;

      timers = timers.filter((other) => other !== timer);
      time = timer.at;
      timer.run();
      due = nextDue(end);
    }

    time = end;
  };

  return { schedule, now: () => time, advance };
};

export interface TestGame {
  game: TableRoomGame;
  members: TableRoomMembers;
  feed: TableRoomFeed;
  cards: TableRoomCards;
  clock: TableRoomClock;
  bots: TableRoomBots;
  timers: TestTimers;
}

// A table with `people` sitting at it (ids p0, p1, …), on a hand-moved clock.
export const createTestGame = (people = 3, seed = 1): TestGame => {
  const timers = createTestTimers();
  const members = new TableRoomMembers(() => 0);
  let lines = 0;
  let bots = 0;
  const feed = new TableRoomFeed({ now: timers.now, createId: () => `line-${++lines}`, maxItems: 200 });
  const cards = new TableRoomCards({ random: createRandom(seed) });
  const clock = new TableRoomClock({ schedule: timers.schedule, now: timers.now });
  const table: { bots?: TableRoomBots } = {};
  const changed = (): void => table.bots?.drive();
  const game = new TableRoomGame({ members, feed, cards, clock, now: timers.now, changed });

  table.bots = new TableRoomBots({ members, feed, game, cards, schedule: timers.schedule, now: timers.now, random: createRandom(seed + 1), createId: () => String(++bots), changed });
  Array.from({ length: people }, (_, index) => members.join(`p${index}`, `Player ${index}`));

  return { game, members, feed, cards, clock, bots: table.bots, timers };
};
