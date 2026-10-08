import { gameLimits, type TableIntentType } from '@wild-table/protocol';

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
    } satisfies Record<TableIntentType, Rate>,
  },
} as const;
