import { gameLimits, raceBeatMs, type TableIntentType } from '@wild-table/protocol';

export interface Rate {
  count: number;
  windowMs: number;
}

// Every rate limit, size cap and timeout of core-api, in one place (spec §10.5).
export const limits = {
  table: {
    // People at one table (spec D8). Seats held for reconnecting people count too.
    maxClients: gameLimits.maxPlayers,
    // An empty table is kept this long, then thrown away (spec D15).
    emptyGraceMs: 10 * 60 * 1000,
    // A dropped connection keeps its seat this long (spec D15).
    reconnectSeconds: 20,
    // The scores show this long after a round, unless someone presses Next round (spec §4.3).
    roundOverMs: 10_000,
    // After a Last card! race opens, the next player's turn waits this long (spec §5.6).
    raceBeatMs,
    // How long a bot thinks before its move (spec §6).
    botThinkMs: { min: 1000, max: 3000 },
    // Hard cap on messages from one connection; Colyseus disconnects anyone above it.
    maxMessagesPerSecond: 100,
    // Per person and intent: at most `count` in any `windowMs`. Extra messages are refused.
    rates: {
      sync: { count: 5, windowMs: 10_000 },
      updateSettings: { count: 20, windowMs: 5000 },
      // Looser than the browser's pace (protocol `chatPace`, 5 in 3 s), so jitter never trips it.
      chat: { count: 8, windowMs: 3000 },
      react: { count: 8, windowMs: 1000 },
      rename: { count: 10, windowMs: 10_000 },
      addBot: { count: 10, windowMs: 5000 },
      removeBot: { count: 10, windowMs: 5000 },
      start: { count: 5, windowMs: 10_000 },
      play: { count: 10, windowMs: 2000 },
      draw: { count: 10, windowMs: 2000 },
      keep: { count: 10, windowMs: 2000 },
      pickColour: { count: 10, windowMs: 2000 },
      challenge: { count: 5, windowMs: 2000 },
      take: { count: 5, windowMs: 2000 },
      swap: { count: 5, windowMs: 2000 },
      bell: { count: 4, windowMs: 1000 },
      // At most 10 a second (spec §10.5).
      hover: { count: 10, windowMs: 1000 },
      // One every 3 seconds (spec §10.5).
      emote: { count: 1, windowMs: 3000 },
      nextRound: { count: 5, windowMs: 5000 },
      playAgain: { count: 5, windowMs: 5000 },
    } satisfies Record<TableIntentType, Rate>,
  },
} as const;
