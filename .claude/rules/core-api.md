---
paths:
  - "modules/core-api/**"
---

# Core API rules (`modules/core-api`)

Node + Express 5 for HTTP, and Colyseus 0.18 for the live multiplayer rooms. These rules come on top of the lint rules in `eslint.config.mjs` and follow the same ideas as the web rules: thin edges, small named units, and logic in small state machines.

**Colyseus specifics:**
- One process serves both: `new Server({ transport: new WebSocketTransport(), express: (app) => … })` in `src/index.ts`. Colyseus answers `/matchmake/*` and the WebSocket upgrades; everything else falls through to Express. No Redis (one process).
- Room classes extend Colyseus `Room<{ client }>`. Class fields like `maxClients` and `autoDispose` are fine (Colyseus re-installs its accessors in `__init`).
- **No Schema state, and no peeking** (spec D13, §10.4). The room sends each person their own view as messages, through `TableRoomOutbox` (the shapes are `TableEvents` in the protocol): `view` (shared, sent when it changed), `feed`, `reaction` and `error` events. With the game come `hand` (to one person: their cards), `peek` (the challenged hand, to the challenger only), and `played`, `drew`, `hover`, `emote` and `race` events for everyone. Messages arrive in order, which state patches don't promise. A browser gets nothing personal until it sends `sync`.
- **Nobody sees another hand,** not even in pieces: others get a card count, and a card's face only once it's on the pile. A `drew` event tells the table how many, and the faces go to the drawer alone. The room test will record every message one player gets and check that no card from another hand appears in it (spec §11).
- Message handlers follow rule 3 through the room's `#on(type, handle)`: valibot schema from the protocol, then the rate limit, then one call. Don't pass a schema to Colyseus's own `onMessage`/`validate`: a failed check there disconnects the sender. Refusals go back as an `error` event (`{ code }`).
- Join options are checked in `onJoin`; a refused join throws `ServerError` with the typed code as its message.
- Tests: unit tests per part (`*.test.ts` next to it) and a room test through a real server with `@colyseus/testing` (`table-room/index.test.ts`, on port 2592). Run `pnpm --filter @wild-table/core-api test`.

## 1. Names follow the owner
A unit that belongs to another starts with its owner's name:
- `TableRoom` → `TableRoomGame` → `TableRoomGameClock`
- `TableRoom` → `TableRoomCards` → `TableRoomCardsHands`

Shared building blocks are named for what they are: `logger`, `limits`.

## 2. One unit per file
- One class, one router or one handler group per file.
- Files and folders are kebab-case, named after what they hold: `table-room-cards.ts` (`TableRoomCards`), `health-router.ts` (`healthRouter`). The lint rule `local/kebab-case-filenames` enforces it.
- A unit with sub-units becomes a folder: `index.ts` holds the main unit, and each sub-unit gets a short-named file next to it (`table-room/index.ts`, `table-room/cards.ts`).

## 3. Edges are thin
This is the backend version of "components only render". Express route handlers and live message handlers do exactly three things:
1. Validate the input with the shared schema.
2. Call **one** method on a service or room class.
3. Send the result, or a typed error.

No game rules, storage or calculations inside handlers.

## 4. Logic lives in small state-machine classes
- **Composed rooms** (spec §10.3). A room is built from small classes, each owning one concern: the game and its clock (`TableRoomGame`), the deck, pile and hands (`TableRoomCards`), the out-of-turn races (`TableRoomRaces`: Last card!, jump-in), the bots (`TableRoomBots`), feed/chat, lifecycle (the 10-minute empty timer), rate limits. `TableRoom` only wires them together.
- **Explicit states.** Each class has a fixed set of states:
  - room lifecycle: `'active' | 'emptyGrace' | 'closed'`;
  - the game: `'lobby'` for now; with the game, `lobby → round → round end → next round | podium → lobby`.
- **Transitions** are methods named after events: `join`, `leave`, `start`, `play`, `draw`, `callLastCard`, `challenge`, `expire`. An invalid transition is rejected with a typed error code.
- **Pure game logic** (the deck and shuffle, legal plays, every card's effect, the house rules, scoring, the bots' choices) lives in the shared engine module and has no I/O.
- **Tests.** Each state-machine class has unit tests for its transitions, including the rejected ones.

## 5. The server decides; clients only ask
- **Intents, not results.** Clients send intents such as `play` or `draw`, and the server works out the result. Never accept a finished result from a client, like "my turn is over" or "I won the round".
- **Validate everything.** Check every message and request body against its schema:
  - reject unknown fields;
  - clamp numbers to sane ranges;
  - check the sender is allowed (only the player whose turn it is plays a card, except a jump-in; a card must be in the sender's own hand).
- **Limits in one place.** Rate limits and size caps are constants in a single `limits.ts` (spec §10.5).

## 6. Every piece of memory has an owner
- **No database.** Tables, decks and hands live in memory.
- **Cleanup.** Every `Map`, timer and interval belongs to a class that clears it in `dispose()`.
- **No module-level mutable state**, except the composition root (`src/index.ts`), which creates the long-lived instances.

## 7. Config, errors and logs
- **Config:** environment variables are read and validated once in `src/config.ts`. Nothing else reads `process.env`.
- **Errors:** use typed error codes shared with the web app, like `'WRONG_PHASE'` or `'RATE_LIMITED'`. Never use raw strings.
- **Logs:** log through `src/logger.ts` with context such as `roomId` and `sessionId`. No `console.log` anywhere else. Never log a hand's cards.

## 8. One shared contract
- Intent schemas, server events, error codes and name rules live in `@wild-table/protocol`. Both apps import them. Never redefine them in core-api.
- Changing an intent's or an event's shape bumps `tableProtocolVersion`.

## Folder example
```
src/
├─ index.ts                 composition root: config, logger, Express, Colyseus, listen
├─ config.ts
├─ logger.ts
├─ limits.ts
├─ errors/                  ApiErrorException, errorMiddleware, notFoundMiddleware
├─ health/index.ts          healthRouter (/api/health)
└─ table-room/
   ├─ index.ts              TableRoom: wires the parts to Colyseus
   ├─ members.ts            TableRoomMembers (+ member-names.ts: the names it hands out)
   ├─ feed.ts               TableRoomFeed
   ├─ game.ts               TableRoomGame (the lobby and the settings, for now)
   ├─ view.ts               what's sent: the shared view
   ├─ outbox.ts             TableRoomOutbox (what each person is sent, and when)
   ├─ rate-limits.ts        TableRoomRateLimits
   ├─ lifecycle.ts          TableRoomLifecycle
   ├─ error.ts              TableRoomError (a typed refusal)
   └─ *.test.ts             (test-table.ts: a game with people at the table)
```
