import type { GamePhase, GameSettingKey, GameSettings } from './game.js';
import type { PlayerColor } from './players.js';

// What a table looks like to one person. The web app's stores read only these shapes, so the demo
// referee and the real server are interchangeable behind them (spec D18). Hands will be sent to
// their owner alone (D13): no shape here carries anyone's cards.

export interface MemberSnapshot {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
}

export interface GameSnapshot {
  phase: GamePhase;
  settings: GameSettings;
}

// What a system line says. Kept as data, so each viewer reads it in their own language.
export type FeedEvent =
  | { type: 'joined' }
  | { type: 'left' }
  | { type: 'renamed'; name: string }
  | { type: 'setting'; setting: GameSettingKey; value: number };

interface FeedItemBase {
  id: string;
  authorId: string;
  // Their latest name and their colour, kept for when they're no longer at the table.
  authorName: string;
  authorColor: PlayerColor;
  at: number;
}

export type FeedItem = (FeedItemBase & { kind: 'message'; text: string }) | (FeedItemBase & { kind: 'system'; event: FeedEvent });

export interface TableSnapshot {
  members: MemberSnapshot[];
  game: GameSnapshot;
  feed: FeedItem[];
}

export interface TableReactionEvent {
  memberId: string;
  emoji: string;
}

// Feed lines a table keeps (and a browser shows); the oldest go first.
export const feedMaxItems = 200;
