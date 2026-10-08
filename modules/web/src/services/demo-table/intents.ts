import type { Move } from '@wild-table/engine';
import type { EmoteLine, GameSettingsPatch, TableIntents, TableIntentType } from '@wild-table/protocol';

export type DemoHandlers = { [K in TableIntentType]: (memberId: string, message: TableIntents[K]) => void };

// What the referee does about the table.
export interface DemoMoves {
  updateSettings: (memberId: string, patch: GameSettingsPatch) => void;
  chat: (memberId: string, text: string) => void;
  rename: (memberId: string, name: string) => void;
  addBot: (memberId: string) => void;
  removeBot: (memberId: string, botId: string) => void;
  start: (memberId: string) => void;
  // A move in the round; `type` is the intent, to say which one a refusal was about.
  move: (memberId: string, type: TableIntentType, move: Move, strength?: number) => void;
  emote: (memberId: string, line: EmoteLine) => void;
  nextRound: (memberId: string) => void;
  playAgain: (memberId: string) => void;
}

const ignore = (): void => undefined;

// Each intent and the move that answers it. Reactions and hovers matter only to other people, and
// at the demo table everyone else is a sample player or a bot. The demo sends everything as it
// changes, so `sync` has nothing to catch up on.
export const demoHandlers = (moves: DemoMoves): DemoHandlers => ({
  sync: ignore,
  updateSettings: (id, patch) => moves.updateSettings(id, patch),
  chat: (id, { text }) => moves.chat(id, text),
  react: ignore,
  rename: (id, { name }) => moves.rename(id, name),
  addBot: (id) => moves.addBot(id),
  removeBot: (id, { memberId }) => moves.removeBot(id, memberId),
  start: (id) => moves.start(id),
  play: (id, { cardId, strength }) => moves.move(id, 'play', { type: 'play', cardId }, strength),
  draw: (id) => moves.move(id, 'draw', { type: 'draw' }),
  keep: (id) => moves.move(id, 'keep', { type: 'keep' }),
  pickColour: (id, { colour }) => moves.move(id, 'pickColour', { type: 'pickColour', colour }),
  challenge: (id) => moves.move(id, 'challenge', { type: 'challenge' }),
  take: (id) => moves.move(id, 'take', { type: 'take' }),
  swap: (id, { target }) => moves.move(id, 'swap', { type: 'swap', target }),
  bell: (id) => moves.move(id, 'bell', { type: 'bell' }),
  hover: ignore,
  emote: (id, { line }) => moves.emote(id, line),
  nextRound: (id) => moves.nextRound(id),
  playAgain: (id) => moves.playAgain(id),
});
