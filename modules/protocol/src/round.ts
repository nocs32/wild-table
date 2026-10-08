// A match and its rounds as people see them (spec §4, §10.4). Nobody sees another hand (D13):
// seats carry a card count, and a card's face is public only once it's on the pile, or when the
// round ends and every hand turns face up.
import type { Card, CardColour } from './cards.js';
import type { PlayerColor } from './players.js';

// What the player whose turn it is has to do now: play or draw, play or keep a drawn card, pick the
// colour after a wild, answer a +2 or +4, or pick whose hand to swap with (7-0).
export type TurnStepKind = 'play' | 'drawn' | 'pickColour' | 'answer' | 'swap';

export type DrawReason = 'draw' | 'plus' | 'bell' | 'challenge' | 'timeout';

// A seat in the match, as everyone sees it.
export interface SeatSnapshot {
  // The member in it, and their name and colour (kept for the round if they leave).
  id: string;
  name: string;
  color: PlayerColor;
  // How many cards they hold, never which.
  cards: number;
  score: number;
  // A bot is playing the seat: its person dropped out, or ran out of time twice in a row (D11, §4.5).
  standIn: boolean;
}

// The round in progress, the same for everyone.
export interface RoundSnapshot {
  top: Card;
  colour: CardColour;
  turn: string;
  step: TurnStepKind;
  direction: 1 | -1;
  deckSize: number;
  // Cards waiting for the victim of a +2 or +4.
  pendingDraw: number;
  // Who has hit the Last card! bell this round: once each (§5.6).
  bellsRung: string[];
  // While a Wild +4 waits for an answer: the colour in play it was played on. A challenge asks
  // whether its player held that colour (§5.5).
  challengeColour: CardColour | null;
  // When the turn's time runs out, on the server's clock.
  endsAt: number;
}

// The round that just ended: every hand face up, and what the winner scored.
export interface RoundResult {
  winner: string;
  points: number;
  hands: Record<string, Card[]>;
}

export interface MatchSnapshot {
  // The round's number, from 1.
  number: number;
  seats: SeatSnapshot[];
  round: RoundSnapshot | null;
  result: RoundResult | null;
  // When the next round is dealt, after one ends.
  nextAt: number | null;
  // Who won the match, at the podium.
  champion: string | null;
}

// What just happened at the table, for everyone: animations and captions (spec D7, §8). Drawn
// cards' faces go to the drawer alone, in their hand.
export type PlayEvent =
  | { type: 'dealt'; first: Card; handSize: number }
  | { type: 'played'; seat: string; card: Card; jumpIn: boolean; strength: number }
  | { type: 'drew'; seat: string; count: number; reason: DrawReason }
  | { type: 'kept'; seat: string }
  | { type: 'colour'; seat: string; colour: CardColour }
  | { type: 'skipped'; seat: string }
  | { type: 'reversed'; direction: 1 | -1 }
  | { type: 'challenged'; seat: string; against: string; bluff: boolean }
  | { type: 'swapped'; seat: string; with: string }
  | { type: 'handsPassed'; direction: 1 | -1 }
  // The Last card! bell (§5.6): `seat` hit it on their turn, and everyone in `hit`, down to one
  // card, draws 2 (the ringer draws 1).
  | { type: 'bell'; seat: string; hit: string[] }
  | { type: 'reshuffled' }
  // Out of time at this step: the table made the move for them (draw, keep, pick, take or swap).
  | { type: 'timedOut'; seat: string; step: TurnStepKind }
  | { type: 'roundOver'; winner: string; points: number };

// The emote wheel's lines (spec §7): picked from your own portrait, shown in a speech bubble.
export const emoteLines = ['hello', 'wellPlayed', 'oops', 'sorry', 'hurry', 'mwahaha'] as const;

export type EmoteLine = (typeof emoteLines)[number];
