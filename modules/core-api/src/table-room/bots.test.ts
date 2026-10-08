import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { createTestGame } from './test-table.js';

const setUp = createTestGame;

const events = (table: ReturnType<typeof setUp>): unknown[] => table.feed.items.map((item) => (item.kind === 'system' ? item.event : null));

test('anyone may sit a bot down; it gets a bot name and a feed line', () => {
  const table = setUp(2);
  const bot = table.bots.add('p1');

  expect(bot).toEqual({ id: 'bot-1', name: 'Ace', color: expect.any(String), connected: true, bot: true });
  expect(table.members.count).toBe(3);
  expect(table.members.people).toBe(2);
  expect(events(table)).toEqual([{ type: 'botAdded', name: 'Ace' }]);
});

test('bots fill free seats only, and only bots can be sent away', () => {
  const table = setUp(2);

  [1, 2, 3, 4].forEach(() => table.bots.add('p0'));
  expect(() => table.bots.add('p0')).toThrow(new TableRoomError('TABLE_FULL'));
  expect(() => table.bots.remove('p0', 'p1')).toThrow(new TableRoomError('NOT_A_BOT'));

  table.bots.remove('p1', 'bot-2');
  expect(table.members.all.map((member) => member.name)).toEqual(['Player 0', 'Player 1', 'Ace', 'Dice', 'Domino']);
  expect(events(table).at(-1)).toEqual({ type: 'botRemoved', name: 'Chip' });
});

test('someone arriving at a full table takes the newest bot’s seat', () => {
  const table = setUp(1);

  [1, 2, 3, 4, 5].forEach(() => table.bots.add('p0'));
  table.bots.makeRoom();

  expect(table.members.count).toBe(5);
  expect(table.members.newestBot?.name).toBe('Domino');
  expect(events(table).at(-1)).toEqual({ type: 'left' });
});

test('a table with room, or without bots, makes no room', () => {
  const table = setUp(3);

  table.bots.makeRoom();
  expect(table.members.count).toBe(3);
});

// Where a round stands: whose turn, which step, and how many cards on the pile and in their hand.
const moment = (table: ReturnType<typeof setUp>): string => {
  const round = table.cards.round;

  return round ? [round.turn, round.step.kind, round.pile.length, table.cards.cardsOf(round.turn)].join('|') : '';
};

// Two people, and a bot standing in for whoever's turn it is: they ran out of time twice.
const standInOnTurn = (): { table: ReturnType<typeof setUp>; seat: string } => {
  const table = setUp(2);

  table.game.start('p0');

  const seat = table.cards.round?.turn ?? '';

  table.game.match.timedOut(seat);
  table.game.match.timedOut(seat);
  table.bots.drive();

  return { table, seat };
};

test('a bot standing in for someone still here waits a few seconds on their turn, so a move of their own brings them back', () => {
  const { table, seat } = standInOnTurn();
  const before = moment(table);

  table.timers.advance(5000);
  expect(moment(table)).toBe(before);

  table.game.move(seat, { type: 'draw' }, 0);
  expect(table.game.match.standIns.has(seat)).toBe(false);
});

test('if they make no move, the bot plays their turn after the wait and its think', () => {
  const { table } = standInOnTurn();
  const before = moment(table);

  table.timers.advance(8000);
  expect(moment(table)).not.toBe(before);
});

test('a bot standing in for someone who left plays at its usual pace', () => {
  const table = setUp(2);

  table.game.start('p0');

  const seat = table.cards.round?.turn ?? '';

  table.members.leave(seat);
  table.game.leave(seat);
  table.bots.drive();

  const before = moment(table);

  table.timers.advance(3000);
  expect(moment(table)).not.toBe(before);
});
