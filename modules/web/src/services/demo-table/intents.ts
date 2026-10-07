import type { GameSettings, TableIntents, TableIntentType } from '@wild-table/protocol';

export type DemoHandlers = { [K in TableIntentType]: (memberId: string, message: TableIntents[K]) => void };

// What the referee does about the table.
export interface DemoMoves {
  updateSettings: (memberId: string, patch: Partial<GameSettings>) => void;
  chat: (memberId: string, text: string) => void;
  rename: (memberId: string, name: string) => void;
}

const ignore = (): void => undefined;

// Each intent and the move that answers it. Reactions matter only to other people, and at the demo
// table everyone else is a sample player. The demo sends everything as it changes, so `sync` has
// nothing to catch up on.
export const demoHandlers = (moves: DemoMoves): DemoHandlers => ({
  sync: ignore,
  updateSettings: (id, patch) => moves.updateSettings(id, patch),
  chat: (id, { text }) => moves.chat(id, text),
  react: ignore,
  rename: (id, { name }) => moves.rename(id, name),
});
