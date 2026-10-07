import { Server } from '@colyseus/core';
import type { Room as SdkRoom } from '@colyseus/sdk';
import { ColyseusTestServer } from '@colyseus/testing';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { tableProtocolVersion, tableRoomName, type TableEvents, type TableJoinOptions } from '@wild-table/protocol';
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest';
import { TableRoom } from './index.js';

// Away from the dev servers' ports (2567–2570) and Telephone Table's room test (2591), so tests run
// while the games do. `boot` would always use 2568 for a Server instance, so the server is started here.
const port = 2592;

let colyseus: ColyseusTestServer;

beforeAll(async () => {
  const server = new Server({ transport: new WebSocketTransport(), greet: false });

  server.define(tableRoomName, TableRoom);
  await server.listen(port);
  colyseus = new ColyseusTestServer(server);
});

afterEach(async () => {
  await colyseus.cleanup();
});

afterAll(async () => {
  await colyseus.shutdown();
});

interface Logged {
  type: string;
  payload: unknown;
}

// One browser at the table, recording every message it gets.
interface Seat {
  room: SdkRoom;
  log: Logged[];
}

const joinOptions = (name: string): TableJoinOptions => ({ protocolVersion: tableProtocolVersion, name });

const listen = (room: SdkRoom): Seat => {
  const seat: Seat = { room, log: [] };

  room.onMessage('*', (type, payload) => seat.log.push({ type: String(type), payload }));
  room.send('sync', {});

  return seat;
};

const all = <K extends keyof TableEvents>(seat: Seat, type: K): Array<TableEvents[K]> =>
  seat.log.filter((logged) => logged.type === type).map((logged) => logged.payload as TableEvents[K]);

const latest = <K extends keyof TableEvents>(seat: Seat, type: K): TableEvents[K] | undefined => all(seat, type).at(-1);

const until = async (check: () => boolean, timeoutMs = 3000): Promise<void> => {
  const started = Date.now();

  while (!check()) {
    if (Date.now() - started > timeoutMs) throw new Error('Timed out waiting for the room');

    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

const sitDown = async (count: number): Promise<Seat[]> => {
  const first = listen(await colyseus.sdk.create(tableRoomName, joinOptions('Player 0')));
  const joining = Array.from({ length: count - 1 }, async (_, index) => listen(await colyseus.sdk.joinById(first.room.roomId, joinOptions(`Player ${index + 1}`))));
  const seats = [first, ...(await Promise.all(joining))];

  await until(() => seats.every((seat) => latest(seat, 'view')?.members.length === count));

  return seats;
};

// Every chat and system line a browser has been sent, in order.
const feedOf = (seat: Seat): string[] =>
  all(seat, 'feed').flatMap((event) => event.items.map((item) => (item.kind === 'message' ? item.text : item.event.type)));

test('a web app on another protocol version is turned away', async () => {
  await expect(colyseus.sdk.create(tableRoomName, { protocolVersion: 0, name: null })).rejects.toThrow('PROTOCOL_MISMATCH');
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

  const back = listen(await colyseus.sdk.reconnect(token));

  await until(() => latest(back, 'view') !== undefined && latest(back, 'feed')?.reset === true);
  expect(back.room.sessionId).toBe(bo.room.sessionId);
  await until(() => latest(ana, 'view')?.members.every((member) => member.connected) === true);
});
