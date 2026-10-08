import { tableRoomName } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { all, feedOf, joinOptions, latest, listen, sitDown as sitDownAt, until, useTestRoom, type Seat } from './test-room.js';

// The lobby through a real room (port 2592; the match test uses 2593).
const room = useTestRoom(2592);

const sitDown = (count: number): Promise<Seat[]> => sitDownAt(room, count);

test('a web app on another protocol version is turned away', async () => {
  await expect(room.colyseus().sdk.create(tableRoomName, { protocolVersion: 0, name: null })).rejects.toThrow('PROTOCOL_MISMATCH');
});

test('everyone sees who sat down, and a settings change reaches everyone with a feed line', async () => {
  const [ana, bo] = (await sitDown(2)) as [Seat, Seat];

  expect(latest(ana, 'view')?.members.map((member) => member.name)).toEqual(['Player 0', 'Player 1']);

  bo.room.send('updateSettings', { targetScore: 450 });
  await until(() => latest(ana, 'view')?.game.settings.targetScore === 450);
  await until(() => feedOf(ana).includes('setting'));
});

test('chat goes to everyone; a reaction goes to everyone else', async () => {
  const [ana, bo, cy] = (await sitDown(3)) as [Seat, Seat, Seat];

  ana.room.send('chat', { text: '  hello table  ' });
  await until(() => [ana, bo, cy].every((seat) => feedOf(seat).includes('hello table')));

  bo.room.send('react', { emoji: '🔥' });
  await until(() => all(ana, 'reaction').length === 1 && all(cy, 'reaction').length === 1);
  expect(latest(cy, 'reaction')).toEqual({ memberId: bo.room.sessionId, emoji: '🔥' });
  expect(all(bo, 'reaction')).toEqual([]);
});

test('bots sit down from the lobby, and a newcomer at a full table takes the newest bot’s seat', async () => {
  const [ana] = (await sitDown(1)) as [Seat];

  [1, 2, 3, 4, 5].forEach(() => ana.room.send('addBot', {}));
  await until(() => latest(ana, 'view')?.members.length === 6);
  expect(latest(ana, 'view')?.members.filter((member) => member.bot).map((member) => member.name)).toEqual(['Ace', 'Chip', 'Dice', 'Domino', 'Jinx']);

  ana.room.send('addBot', {});
  await until(() => latest(ana, 'error')?.code === 'TABLE_FULL');

  const bo = listen(await room.colyseus().sdk.joinById(ana.room.roomId, joinOptions('Bo')));

  await until(() => latest(bo, 'view')?.members.map((member) => member.name).join() === 'Player 0,Ace,Chip,Dice,Domino,Bo');
});

test('a refused message comes back as an error, and the sender stays', async () => {
  const [ana] = (await sitDown(1)) as [Seat];

  ana.room.send('rename', { name: '   ' });
  await until(() => latest(ana, 'error')?.code === 'EMPTY_NAME');

  ana.room.send('updateSettings', { targetScore: 300, surprise: true });
  await until(() => latest(ana, 'error')?.code === 'INVALID_MESSAGE');
  expect(ana.room.connection.isOpen).toBe(true);
});

test('a reload keeps the seat: the table holds it and sends everything again', async () => {
  const [ana, bo] = (await sitDown(2)) as [Seat, Seat];
  const token = bo.room.reconnectionToken;

  await bo.room.leave(false);
  await until(() => latest(ana, 'view')?.members.some((member) => !member.connected) === true);

  const back = listen(await room.colyseus().sdk.reconnect(token));

  await until(() => latest(back, 'view') !== undefined && latest(back, 'feed')?.reset === true);
  expect(back.room.sessionId).toBe(bo.room.sessionId);
  await until(() => latest(ana, 'view')?.members.every((member) => member.connected) === true);
});
