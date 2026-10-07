import { TableRoomFeed } from './feed.js';
import { TableRoomGame } from './game.js';
import { TableRoomMembers } from './members.js';

export interface TestGame {
  game: TableRoomGame;
  members: TableRoomMembers;
  feed: TableRoomFeed;
}

// A game with `people` at the table (ids p0, p1, …).
export const createTestGame = (people = 3): TestGame => {
  const members = new TableRoomMembers(() => 0);
  let id = 0;
  const feed = new TableRoomFeed({ now: () => 0, createId: () => `line-${++id}`, maxItems: 200 });
  const game = new TableRoomGame({ members, feed });

  Array.from({ length: people }, (_, index) => members.join(`p${index}`, `Player ${index}`));

  return { game, members, feed };
};
