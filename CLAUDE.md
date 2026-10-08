# Wild Table

A multiplayer card game on a 3D table:
- share a table by URL, add bots if you're short, and play an Uno-style game: match the top card's colour or number, hit each other with action cards, and empty your hand first to win the round;
- Hearthstone's feel (cards that lift, tilt, fly and slap) in a 90s basement rec room; the table is thrown away about 10 minutes after everyone leaves.

It's the fourth sibling of Felt Table (`../felt-table-jigsaw`), Scribble Table (`../drawing-game`) and Telephone Table (`../telephone-table`): same stack, same house rules, same design system, plus a 3D layer. It's its own project, copied from Telephone Table: fixes to shared parts get copied between the projects by hand (spec D3). The full spec is in `.scratch/SPEC.md`. Read §0 "Decisions so far" before planning any feature: every decision there is settled.

## How we work
Setup commit first (M0), then each phase gets its own branch and PR, as in the siblings (spec D17, §12):
1. **Web UI** (`feat/web-ui`), on local MobX stores against the demo table. **It starts with a feel check** of the 3D hand (hover, drag, throw, click, the slap) against the simplest bot, on a laptop and a real phone, reviewed together before the rest is built. Then we review it all together, then PR and merge.
2. **Backend, and connecting the UI to it** (`feat/live-tables`). We review and check it together, then PR and merge.
3. **CI** (`feat/ci`). PR and merge. The workflow (`.github/workflows/ci.yml`) came with the setup commit and has checked every PR since; the badge is in the README.
4. **Hosting** (`feat/hosting`): `pnpm play` and the `wild-table` Cloudflare Tunnel on wild.timnox.dev. The tunnel and its DNS record were created in M4 (credentials in `~/.cloudflared/`).

**Every feature explains itself on screen** (spec D7, D27): cards you can play glow, a card that can't be played says why, the first time each special card is played a caption says what it did, and the rule book is one click away. Anything else people wouldn't guess (drag vs click, the Last card! bell, the +4 challenge, house-rule tent cards, emotes from your portrait, the props to poke) gets a short line or hint right where it's used. Check it in every UI review.

**Never say "Uno"** (spec D2): it's a trademark. Not in UI text in either language, the rule book or the README. The game has its own card design, and the one-card call is **"Last card!"**.

## Scribble Table's word lists stay secret
The user plays Scribble Table, so knowing its words would spoil it. Nothing in this game is secret from the user, and Wild Table has no word lists, but one rule guards the sibling's: **never open, decode or print** `../drawing-game/modules/core-api/src/words/word-list.b64`, and never show a word from it anywhere.

## Layout
- `modules/web`: frontend. Vite + React 19 + TypeScript, Panda CSS, MobX, Ark UI, i18next (English and Ukrainian), and the 3D table with React Three Fiber, drei and postprocessing (spec D4, §10.2) in `features/room/table`: the room and its props in `table/room` (the pinball machine's dot-matrix display scrolls who won; the jukebox flashes for a round won), a round's cards, pile, deck, bell, place cards (with the Skip stamp), the colour orbs and your fuse along the rail in `table/round`. The HTML over a round (the turn's prompt, the captions, the scores and the podium) is `features/room/round`.
  - `src/art`: everything drawn by code (spec §8.4): the card faces and back, the felt, the panelling, the leaflet, the tent cards, the neon sign. Colours and typeface come from the Panda tokens.
  - Per-frame data (springs, drags, the deck's cards, a round's cards) lives in plain objects such as `stores/table/body.ts` and `stores/table/round/body.ts`, read in `useFrame`, never through React state (spec §8.3). A round's events play one beat at a time (`stores/table/round`), then the cards settle on what the table says is true. When the beats run late (a tab in the background) or pile up, the queue is skipped and the cards settle at once. Big cards' moments (the slam's camera shake and lamp swing, the winning card's slow motion, the jukebox flash) are timestamps in `table.round.effects`.
  - **Lighter graphics** (`stores/graphics.ts`, spec §8.3): no shadows, no glow, one pixel per pixel. drei's `PerformanceMonitor` turns it on by itself below 40 fps (after the first 6 s), with a caption saying so; the switch is in the speaker's popover in the top bar.
  - **drei's `Html` renders in a React root of its own:** components inside it can't call `useRootStore()`. Hand them what they need as props.
- `modules/core-api`: backend. Node + Express 5 + Colyseus 0.18 (live tables), one process on :2570.
- `modules/protocol`: the shared contract. Intent schemas, server events, error codes.
- `modules/engine`: pure game logic, shared by both apps: the deck, which cards fit and why, a round's moves and every card's effect (`round/`), the house rules, timeouts, the turn's clock and the Last card! race's beat (`round/clock.ts`), scoring, the bots (`bots.ts`: moves, bell and jump-in timing), the rule book's examples, and bot-match simulations (`round/simulate.ts`, run by the tests).
- `eslint.config.mjs` + `eslint-rules/`: the house lint rules for every module.
- `.scratch/`: spec and notes, ignored by git.

## Rules: read them before writing code
- **Before** creating or editing anything in `modules/web/**`, read `.claude/rules/web.md` and follow it.
- **Before** creating or editing anything in `modules/core-api/**`, read `.claude/rules/core-api.md` and follow it.
- These rules load automatically only once a matching file is opened. Read them first anyway, especially when creating new files.
- **Before calling a change done,** run `pnpm lint` and `pnpm typecheck` and fix what they report. Don't disable rules or add `eslint-disable` comments without asking.

**House lint rules** (enforced everywhere):
- **Size:** at most 40 lines per function (components included) and 300 lines per file. Blank lines and comments don't count.
- **Nested functions:** inside a function, only arrow functions. No nested `function` declarations or expressions, and no object or class methods.
- **Names:** camelCase for everything. PascalCase only for React components (which must render JSX) and for types and classes.
- **Return types:** required on every function that returns a value. Lambdas passed as arguments or JSX props are exempt.
- **Blank lines:** exactly one before and after every code block (functions, if, loops, switch, try, multi-line statements). `pnpm lint --fix` adds them.

## Commands
```bash
pnpm install
pnpm dev           # web on http://localhost:5176 + core-api on :2570 (Vite forwards /api, and /live for tables)
pnpm lint          # add --fix to auto-fix spacing
pnpm typecheck
pnpm test          # engine + core-api; one module: pnpm --filter @wild-table/core-api test
pnpm demo          # web only, against the demo table (no server): for UI work
pnpm build         # production web build (CI runs lint, typecheck, test, build on every PR and push to main)
pnpm play          # build + serve at https://wild.timnox.dev from this PC through the wild-table Cloudflare Tunnel
```

## Gotchas
- **Ports are 5176, 2570 and 4176** (web, core-api, preview), one above Telephone Table's (5175, 2569, 4175), two above Scribble Table's and three above Felt Table's, so all four games can run at once. All are `strictPort`: a taken port fails loudly instead of moving. The room tests use 2592 (the lobby) and 2593 (a round, no peeking); Telephone Table's uses 2591.
- **Never stop the siblings' processes.** Felt, Scribble or Telephone Table may be running `pnpm play` for a game night. When a port is busy, check which project owns the process before touching it.
- **TypeScript is pinned to 6.0.** typescript-eslint doesn't support TypeScript 7 yet. Don't upgrade it.
- **pnpm workspaces:** the packages are listed in `pnpm-workspace.yaml`. Add a dependency with `pnpm --filter @wild-table/<module> add <pkg>`.
- **pnpm's release-age guard:** pnpm refuses versions published in the last day. Pick the previous version instead of adding exceptions.
- **No shared Colyseus state, and no peeking** (spec D13, §10.4): the server sends each person only their own hand; others see backs and a count. After joining or reconnecting, the browser asks for everything with `sync`.
- **Hosting is `pnpm play`, not a cloud host** (free, no payment card), as in the siblings. It runs `vite preview` on `127.0.0.1:4176`, which reuses the dev `/api` + `/live` proxy and only accepts the wild.timnox.dev host, plus core-api and the `wild-table` Cloudflare Tunnel (credentials in `~/.cloudflared/`). The tunnel and the wild.timnox.dev DNS record exist since M4 (2026-10-08). Stop `pnpm dev` first, since both need port 2570. The user starts `pnpm play` themselves: don't start it for them, give them the command.
- **The demo table** (spec D18): `services/demo-table` plays the server's part in the browser, with sample players who sit down, say hello and play every seat but yours with the engine's planning bot (spec §6.1), on the server's clock and pace. `pnpm dev` plays at live tables on core-api (`services/live-table`, behind the same `TableClientService`); `pnpm demo` plays at the demo table. The top bar's **Demo** buttons add or remove a sample player.
- **Live tables live in core-api's memory:** `tsx watch` restarts core-api when you save a file there, and every table is gone. Open a new one. To play a live table alone, open its link in three or four tabs: each tab is its own person (its seat is kept in sessionStorage, so a reload gets it back).
- **A dropped connection** keeps its seat for 20 seconds (`limits.ts`).
- **The turn's clock** (engine `round/clock.ts`, used by core-api and the demo table alike): a new turn gets the whole turn time; a new step in the same turn (play or keep a drawn card, pick the colour, pick a hand to swap) keeps what's left, but at least 8 s. When someone drops to one card, a 1.5 s beat holds every play but theirs (jump-ins too) and the next player's draw, so the Last card! race gets its chance; the browser knows (`hand.isHeldBack`) and says why.
- **The protocol version** (`tableProtocolVersion` in `protocol/src/table-messages.ts`) goes up whenever an intent or an event changes shape: an older tab is asked to reload.
- **Phones play in landscape only** (spec D20). The user's group is 3–4 coworkers, some on phones: check every screen at phone size, held sideways.
- **The look: a 90s basement rec room** (spec D21, §8.1), set in `modules/web/panda/tokens.ts`. Two kinds of surface, used the same way everywhere: the room's own (the top bar, the dock, the chat, popovers) is dark walnut, brass trim and lamplit cream lettering; the game's printed things (the lobby's game cards, the rule leaflet, tent cards, the status card) are glossy card stock with ink and the four card colours. Avatars are poker chips, buttons are chunky arcade buttons, the typeface is Rubik throughout (it has Cyrillic). **Nothing in the UI is tilted**: the user asked for everything straight and aligned.
- **Phones held sideways are "compact"** (`ui.layout`, under 900 px wide or 540 px tall): the lobby's cards share one column on the right, the dock stands up as a rail on the left, and the rule book fills the screen.
- **Sounds** are CC0 recordings from Freesound, credited in `modules/web/src/assets/sounds/credits.md` (no music, spec D26). The chime, the cards (slap, deal, riffle), the Last card! bell, the fuse, the pinball jackpot, the props' sounds and the emotes' pop, cut from Freesound's high-quality previews to mono 16-bit 48 kHz clips; generated sounds didn't sound good enough in the siblings, so new ones come from Freesound too. Stores play them through `SoundsService.play` (and `loop` for the fuse).
- **Dev handle:** in development the root store is `window.wildTable`, for checking state from the console or a test script, e.g. `wildTable.room.game.settings.targetScore` or `wildTable.room.presence.count`.
