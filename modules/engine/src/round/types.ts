// A round of the game (spec §4.3, §5): the whole truth, kept by the server (or the demo table's
// referee) and never sent whole. Each person is sent only what they may see (spec D13, §10.4).
import type { Card, CardColour, DrawReason, HouseRules } from '@wild-table/protocol';

// A seat at the table: the member id of whoever sits in it, person or bot.
export type SeatId = string;

// What the player whose turn it is has to do now.
export type TurnStep =
  // Play a card that fits, or draw one.
  | { kind: 'play' }
  // Drew a card that fits: play it, or keep it.
  | { kind: 'drawn'; cardId: string }
  // Played a wild, or one was turned up to start the round (`opening`): pick the colour in play.
  | { kind: 'pickColour'; opening: boolean }
  // Hit by a +2 or a +4 with a choice: stack another (house rule), challenge a +4, or take the cards.
  | { kind: 'answer' }
  // Played a 7 with the 7-0 house rule: pick whose hand to swap with.
  | { kind: 'swap' };

export interface RoundState {
  // Seating order, clockwise.
  seats: SeatId[];
  hands: Record<SeatId, Card[]>;
  // The face-down draw pile; its top is the last card.
  deck: Card[];
  // The face-up pile; its top is the last card.
  pile: Card[];
  // The top card's colour, or the one picked with a wild.
  colour: CardColour;
  turn: SeatId;
  direction: 1 | -1;
  step: TurnStep;
  // Cards waiting for the victim of a +2 or +4 (stacking adds them up).
  pendingDraw: number;
  // The last Wild +4, for a challenge: who played it, whether it was a bluff, the colour in play
  // it was played on, and the hand they held then (what the challenger gets to see).
  wild4: { seat: SeatId; bluff: boolean; colour: CardColour; hand: Card[] } | null;
  // The Last card! race (spec §5.6): open while this seat is down to one card and nobody has hit
  // the bell yet.
  race: SeatId | null;
  // Hit the bell early, holding two cards on their turn: safe once they're down to one. It lasts
  // until that turn ends.
  earlyCall: SeatId | null;
  rules: HouseRules;
  // Who emptied their hand; the round is over.
  winner: SeatId | null;
}

// What happened, in order: the server turns these into what each person is sent, and the browser
// into animations (spec §10.2). Drawn cards are private: only their new owner may see them.
export type RoundEvent =
  | { type: 'flipped'; card: Card }
  | { type: 'played'; seat: SeatId; card: Card; jumpIn: boolean }
  | { type: 'drew'; seat: SeatId; cards: Card[]; reason: DrawReason }
  | { type: 'kept'; seat: SeatId }
  | { type: 'colour'; seat: SeatId; colour: CardColour }
  | { type: 'skipped'; seat: SeatId }
  | { type: 'reversed'; direction: 1 | -1 }
  // The challenger sees the challenged hand (spec §5.5): private to the challenger.
  | { type: 'challenged'; seat: SeatId; against: SeatId; bluff: boolean; hand: Card[] }
  | { type: 'swapped'; seat: SeatId; with: SeatId }
  | { type: 'handsPassed'; direction: 1 | -1 }
  | { type: 'bell'; seat: SeatId; result: 'safe' | 'early' | 'caught'; caught: SeatId | null }
  | { type: 'reshuffled' }
  | { type: 'turn'; seat: SeatId }
  | { type: 'roundOver'; winner: SeatId; points: number };

// What a player asks to do. The engine works out the result (spec §10.3).
export type Move =
  | { type: 'play'; cardId: string }
  | { type: 'draw' }
  | { type: 'keep' }
  | { type: 'pickColour'; colour: CardColour }
  | { type: 'challenge' }
  | { type: 'take' }
  | { type: 'swap'; target: SeatId }
  | { type: 'bell' };

export type MoveError = 'NOT_YOUR_TURN' | 'NOT_IN_HAND' | 'DOES_NOT_FIT' | 'WRONG_STEP' | 'NO_RACE' | 'NOT_A_SEAT' | 'ROUND_OVER';

export type MoveResult = { ok: true; state: RoundState; events: RoundEvent[] } | { ok: false; error: MoveError };

// A move being worked out: a private copy of the state to change, and what happened so far.
export interface RoundContext {
  state: RoundState;
  events: RoundEvent[];
  random: () => number;
}
