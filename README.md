# Wild Table

A card game you play with friends in the browser, on a 3D card table.

- **Match and slap:** play a card that matches the top of the pile by colour or by number, or a Wild. Drag it onto the pile, throw it, or click it twice; the harder you throw, the harder it slaps.
- **Hit back:** Skip, Reverse and +2 land on the next player. A Wild picks the colour; a Wild +4 makes them draw four, unless they dare to challenge it.
- **Last card!** Down to one card? Smack the desk bell before anyone catches you.
- **First to the target score wins:** the round's winner scores the cards left in everyone else's hands.
- **House rules** you can switch on (stacking, jump-in, 7-0 and more), **bots** to fill empty seats, and a **rule book** one click away.
- **A 90s basement rec room:** green felt under a hanging lamp, a pinball machine and a jukebox glowing in the dark, and things on the table to poke while you wait.
- **No accounts, no leftovers:** share the table link to play, in English or Ukrainian, on a computer or a phone held sideways. A table disappears about 10 minutes after the last person leaves.

It's a sibling of [Felt Table](https://github.com/nocs32/felt-table-jigsaw), the multiplayer jigsaw, [Scribble Table](https://github.com/nocs32/scribble-table), the drawing-and-guessing game, and [Telephone Table](https://github.com/nocs32/telephone-table), the telephone drawing game, and shares their stack, rules and look.

> **Status:** the lobby and the rule book are built (M1), and whole matches play at live tables and at the demo table (M2): rounds on the 3D table with your hand to drag, throw or click, every card and its moment (the Skip stamp, the +4's slam, the Wild's wave, the winning card in slow motion), the house rules, the Last card! race, the fuse along the rail, scores, the pinball machine's podium, sounds, lighter graphics for weak laptops, and bots that play their seats, jump in and stand in for people.

## Stack

| Part | Tech |
|---|---|
| Web (`modules/web`) | React 19, TypeScript, Vite, Panda CSS, MobX, Ark UI, i18next, and React Three Fiber, drei and postprocessing for the 3D table |
| API (`modules/core-api`) | Node.js, Express 5 and Colyseus 0.18 (run with `tsx`) |
| Shared | `modules/protocol` (the contract between the two) and `modules/engine` (pure game logic) |
| Tooling | pnpm workspaces, ESLint 10 + typescript-eslint, TypeScript 6.0 |

The server runs the game. It keeps the deck, the hands and the clock, and it sends each person only their own cards, so nobody can peek at a hand: everyone else's cards arrive as backs and a count. Tables live in the server's memory only, so there is no database.

## Getting started

**Requirements:** Node.js 24 (see `.nvmrc`) and pnpm 11+.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts both apps:

| App | URL |
|---|---|
| Web | http://localhost:5176 |
| API | http://localhost:2570 — the web dev server forwards `/api/*`, and `/live` for tables, to it |

Open the web URL to get a table, then share its link: everyone who opens it sits down at the same table. To try it alone, open the link in three or four browser tabs.

`pnpm demo` runs the web app alone against a demo table in the browser, with no API: three sample players sit down with you and a fourth joins a little later. The **Demo** buttons in the top bar add or remove a sample player.

Saving a file in `modules/core-api` restarts the API, which clears every table: open a new one afterwards.

The ports sit one above Telephone Table's (5175 and 2569), two above Scribble Table's and three above Felt Table's, so all four games can run at the same time.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the web app and the API with hot reload |
| `pnpm demo` | Runs the web app alone against the demo table (sample players, no server), for working on the UI |
| `pnpm lint` | Lints every module; `pnpm lint --fix` fixes spacing automatically |
| `pnpm typecheck` | Type-checks every module |
| `pnpm test` | Runs the engine and core-api tests; one module: `pnpm --filter @wild-table/core-api test` |
| `pnpm build` | Builds the web app for production |
| `pnpm play` | Builds, then serves the game at https://wild.timnox.dev from this computer (see below) |

**CI:** GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, test and build on every pull request and every push to `main`.

## Play with friends

There's no cloud server: `pnpm play` runs Wild Table on your own computer, and a free [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) puts it on **https://wild.timnox.dev**. No router ports are opened, and your home address stays hidden behind Cloudflare.

```bash
pnpm play
```

- It builds the web app, then starts core-api, the production web server (`vite preview` on `127.0.0.1:4176`) and the tunnel. Ctrl+C stops all three.
- Stop `pnpm dev` first: both use core-api's port 2570.
- It runs alongside the siblings' `pnpm play`: each game has its own ports and its own tunnel.
- Keep the computer awake while you play. Closing the terminal or restarting wipes the tables, like any server restart.
- To ship a change, stop `pnpm play` and start it again. It rebuilds from what's checked out.

**One-time setup** on the computer that hosts (done in the hosting milestone, M4; until then `pnpm play` stops at the tunnel): install `cloudflared` (`winget install Cloudflare.cloudflared`), open a new terminal so it's on PATH, then:

```bash
cloudflared tunnel create wild-table
```

```bash
cloudflared tunnel route dns wild-table wild.timnox.dev
```

`cloudflared tunnel login` is needed only once per computer, and Felt Table's setup already did it here. The tunnel's credentials live in `~/.cloudflared/`, outside the repo. Keep them private.

## Project layout

```
modules/
├─ web/          React frontend
├─ core-api/     Express + Colyseus backend
├─ protocol/     shared contract: messages, events, error codes
└─ engine/       pure game logic, shared by both apps
eslint.config.mjs   house lint rules
eslint-rules/       custom lint rules used by the config
```

## Conventions

**Code style** (enforced by `pnpm lint`):
- **Size:** at most 40 lines per function (components included) and 300 lines per file.
- **Nested functions:** inside a function, only arrow functions.
- **Names:** camelCase. PascalCase only for React components and for types and classes.
- **Return types:** every function that returns a value declares its return type.
- **Blank lines:** one before and after every code block.

**Web**
- **Component names follow their parent:** `Room` → `RoomLobby` → `RoomLobbySettings`.
- **One component per `.tsx` file.** Components only render.
  - Logic lives in custom hooks and small MobX stores, which are modelled as state machines.
  - Styles live in `styled-components.ts` files written with Panda CSS.
- **All UI text is translated** into English and Ukrainian. What players write is shown as typed, in whatever language they wrote it.

**API**
- **Thin handlers:** they validate, call one service, and respond.
- **Logic** lives in small state-machine classes.
- **The server decides:** browsers send intents (play this card, draw, Last card!) and never results.

**Sounds** are CC0 recordings from [Freesound](https://freesound.org), credited in `modules/web/src/assets/sounds/credits.md`. No music.

**TypeScript** stays on **6.0** until typescript-eslint supports TypeScript 7.

## Environment variables

| Variable | Used by | Default |
|---|---|---|
| `CORE_API_PORT` | core-api | `2570` |
