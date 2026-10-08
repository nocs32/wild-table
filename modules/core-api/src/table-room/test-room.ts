import { Server } from '@colyseus/core';
import type { Room as SdkRoom } from '@colyseus/sdk';
import { ColyseusTestServer } from '@colyseus/testing';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { tableProtocolVersion, tableRoomName, type TableEvents, type TableJoinOptions } from '@wild-table/protocol';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { TableRoom } from './index.js';

// A real table room on a real server, for the room tests: each test file starts its own on its own
// port, away from the dev servers (2567–2570) and Telephone Table's room tests (2591), so tests
// run while the games do. `boot` would always use 2568, so the server is started here.

export interface Logged {
  type: string;
  payload: unknown;
}

// One browser at the table, recording every message it gets.
export interface Seat {
  room: SdkRoom;
  log: Logged[];
}

export interface TestRoom {
  // Only once the server is up (in a test).
  colyseus: () => ColyseusTestServer;
}

export const useTestRoom = (port: number): TestRoom => {
  let colyseus: ColyseusTestServer | null = null;

  beforeAll(async () => {
    const server = new Server({ transport: new WebSocketTransport(), greet: false });

    server.define(tableRoomName, TableRoom);
    await server.listen(port);
    colyseus = new ColyseusTestServer(server);
  });

  afterEach(async () => {
    await colyseus?.cleanup();
  });

  afterAll(async () => {
    await colyseus?.shutdown();
  });

  return {
    colyseus: () => {
      if (!colyseus) throw new Error('The test server is not up yet');

      return colyseus;
    },
  };
};

export const joinOptions = (name: string): TableJoinOptions => ({ protocolVersion: tableProtocolVersion, name });

export const listen = (room: SdkRoom): Seat => {
  const seat: Seat = { room, log: [] };

  room.onMessage('*', (type, payload) => seat.log.push({ type: String(type), payload }));
  room.send('sync', {});

  return seat;
};

export const all = <K extends keyof TableEvents>(seat: Seat, type: K): Array<TableEvents[K]> =>
  seat.log.filter((logged) => logged.type === type).map((logged) => logged.payload as TableEvents[K]);

export const latest = <K extends keyof TableEvents>(seat: Seat, type: K): TableEvents[K] | undefined => all(seat, type).at(-1);

export const until = async (check: () => boolean, timeoutMs = 3000): Promise<void> => {
  const started = Date.now();

  while (!check()) {
    if (Date.now() - started > timeoutMs) throw new Error('Timed out waiting for the room');

    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

export const sitDown = async (room: TestRoom, count: number): Promise<Seat[]> => {
  const { sdk } = room.colyseus();
  const first = listen(await sdk.create(tableRoomName, joinOptions('Player 0')));
  const joining = Array.from({ length: count - 1 }, async (_, index) => listen(await sdk.joinById(first.room.roomId, joinOptions(`Player ${index + 1}`))));
  const seats = [first, ...(await Promise.all(joining))];

  await until(() => seats.every((seat) => latest(seat, 'view')?.members.length === count));

  return seats;
};

// Every chat and system line a browser has been sent, in order.
export const feedOf = (seat: Seat): string[] =>
  all(seat, 'feed').flatMap((event) => event.items.map((item) => (item.kind === 'message' ? item.text : item.event.type)));
