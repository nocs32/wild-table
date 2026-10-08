import { randomUUID } from 'node:crypto';
import { ErrorCode, Room, ServerError, type Client } from '@colyseus/core';
import {
  feedMaxItems,
  tableIntentSchemas,
  tableJoinOptionsSchema,
  tableProtocolVersion,
  type TableErrorCode,
  type TableEvents,
  type TableIntents,
  type TableIntentType,
  type TableJoinOptions,
} from '@wild-table/protocol';
import { customAlphabet } from 'nanoid';
import * as v from 'valibot';
import { limits } from '../limits.js';
import { logger } from '../logger.js';
import { TableRoomBots } from './bots.js';
import { TableRoomError } from './error.js';
import { TableRoomFeed } from './feed.js';
import { TableRoomGame } from './game.js';
import { TableRoomLifecycle, type Schedule } from './lifecycle.js';
import { TableRoomMembers } from './members.js';
import { TableRoomOutbox } from './outbox.js';
import { TableRoomRateLimits } from './rate-limits.js';
import { tableView } from './view.js';

export type TableClient = Client<{ messages: TableEvents }>;

type TableRoomHandler<K extends TableIntentType> = (client: TableClient, message: TableIntents[K]) => void;

const { table } = limits;

// Intents that change nothing in the shared view: no view or feed to send afterwards.
const quietIntents: ReadonlySet<TableIntentType> = new Set(['sync', 'react']);

// Refusals that happen in normal play: a fast hand, or a move that crossed a phase change.
const expectedRefusals: ReadonlySet<TableErrorCode> = new Set(['RATE_LIMITED', 'WRONG_PHASE']);

// 12 characters of [0-9a-z]: about 62 bits, so table links can't be guessed.
const createRoomId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

// The client reads the code from the refused join's error message.
const joinError = (code: TableErrorCode): ServerError => new ServerError(ErrorCode.APPLICATION_ERROR, code);

// A join with bad options, or from a web app on another protocol version, is turned away.
const readJoinOptions = (options: unknown): TableJoinOptions => {
  const result = v.safeParse(tableJoinOptionsSchema, options);

  if (!result.success) throw joinError('INVALID_JOIN');

  if (result.output.protocolVersion !== tableProtocolVersion) throw joinError('PROTOCOL_MISMATCH');

  return result.output;
};

// One shared table. Its parts own the rules: who is here, the game, the bots, the feed, what each
// person is sent, rate limits, and when the empty table is thrown away. This class only wires them
// to Colyseus.
export class TableRoom extends Room<{ client: TableClient }> {
  override maxClients = table.maxClients;
  // The lifecycle decides when an empty table goes, not Colyseus.
  override autoDispose = false;
  override maxMessagesPerSecond = table.maxMessagesPerSecond;
  readonly #schedule: Schedule = (callback, delayMs) => {
    const delayed = this.clock.setTimeout(callback, delayMs);

    return () => delayed.clear();
  };

  readonly #members = new TableRoomMembers(Math.random);
  readonly #feed = new TableRoomFeed({ now: Date.now, createId: randomUUID, maxItems: feedMaxItems });
  readonly #rateLimits = new TableRoomRateLimits(table.rates, Date.now);
  readonly #game = new TableRoomGame({ members: this.#members, feed: this.#feed });
  readonly #bots = new TableRoomBots({ members: this.#members, feed: this.#feed, game: this.#game, createId: randomUUID });

  readonly #outbox = new TableRoomOutbox({
    feed: this.#feed,
    view: () => tableView(this.#members.all, this.#game),
    now: Date.now,
    send: (memberId, type, message) => this.clients.getById(memberId)?.send(type, message),
    broadcast: (type, message) => this.broadcast(type, message),
  });

  readonly #lifecycle = new TableRoomLifecycle({ schedule: this.#schedule, graceMs: table.emptyGraceMs, close: () => void this.disconnect() });

  override onCreate(): void {
    this.roomId = createRoomId();
    this.#listen();
    this.#lifecycle.open();
    logger.info('table created', { roomId: this.roomId });
  }

  override onJoin(client: TableClient, options: unknown): void {
    const { name } = readJoinOptions(options);

    this.#bots.makeRoom();

    const member = this.#members.join(client.sessionId, name);

    this.#lifecycle.join();
    this.#feed.system(member, { type: 'joined' });
    this.#outbox.flush();
    logger.info('table joined', { roomId: this.roomId, sessionId: client.sessionId, people: this.#members.people, seats: this.#members.count });
  }

  // A lost connection keeps its seat for a while; the browser reconnects on its own and asks
  // for everything again with `sync`.
  override onDrop(client: TableClient): void {
    this.#members.drop(client.sessionId);
    this.#outbox.forget(client.sessionId);
    this.#outbox.flush();
    this.allowReconnection(client, table.reconnectSeconds);
  }

  override onReconnect(client: TableClient): void {
    this.#members.reconnect(client.sessionId);
    this.#outbox.flush();
  }

  override onLeave(client: TableClient): void {
    if (!this.#members.has(client.sessionId)) return;

    const member = this.#members.leave(client.sessionId);

    this.#rateLimits.forget(client.sessionId);
    this.#outbox.forget(client.sessionId);
    this.#feed.system(member, { type: 'left' });
    this.#lifecycle.leave(this.#members.people);
    this.#outbox.flush();
    logger.info('table left', { roomId: this.roomId, sessionId: client.sessionId, people: this.#members.people, seats: this.#members.count });
  }

  override onDispose(): void {
    this.#lifecycle.dispose();
    this.#rateLimits.dispose();
    this.#outbox.dispose();
    logger.info('table closed', { roomId: this.roomId });
  }

  #listen(): void {
    this.#on('sync', (client) => this.#outbox.sync(client.sessionId));
    this.#on('updateSettings', (client, patch) => this.#game.updateSettings(client.sessionId, patch));
    this.#on('chat', (client, { text }) => this.#feed.message(this.#members.get(client.sessionId), text));
    this.#on('react', (client, { emoji }) => this.broadcast('reaction', { memberId: client.sessionId, emoji }, { except: client }));
    this.#on('rename', (client, { name }) => this.#rename(client, name));
    this.#on('addBot', (client) => this.#bots.add(client.sessionId));
    this.#on('removeBot', (client, { memberId }) => this.#bots.remove(client.sessionId, memberId));
  }

  // Every handler: validate the message, check the sender's rate, then call the part that owns it,
  // then send out what changed. Anything refused goes back to the sender as an `error` event;
  // nobody gets disconnected for it.
  #on<K extends TableIntentType>(type: K, handle: TableRoomHandler<K>): void {
    this.onMessage(type, (client: TableClient, input: unknown) => {
      const result = v.safeParse(tableIntentSchemas[type], input);

      if (!result.success) return this.#refuse(client, type, 'INVALID_MESSAGE');

      if (!this.#rateLimits.allow(client.sessionId, type)) return this.#refuse(client, type, 'RATE_LIMITED');

      try {
        handle(client, result.output as TableIntents[K]);
      } catch (error) {
        if (!(error instanceof TableRoomError)) throw error;

        this.#refuse(client, type, error.code);
      }

      if (!quietIntents.has(type)) this.#outbox.flush();
    });
  }

  #rename(client: TableClient, text: string): void {
    const name = this.#members.rename(client.sessionId, text);

    if (name !== null) this.#feed.system(this.#members.get(client.sessionId), { type: 'renamed', name });
  }

  #refuse(client: TableClient, type: TableIntentType, code: TableErrorCode): void {
    if (!expectedRefusals.has(code)) logger.warn('table message refused', { roomId: this.roomId, sessionId: client.sessionId, type, code });

    client.send('error', { code, type });
  }
}
