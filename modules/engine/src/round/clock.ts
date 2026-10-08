// The turn's clock (spec D11), shared by the server and the demo table so both keep the same time.
import type { RoundEvent } from './types.js';

// A new step within a turn (play or keep a drawn card, pick the colour, pick whose hand to swap
// with) gets at least this long, even when the turn's time is nearly out.
export const stepMinMs = 8000;

export interface TurnClockTimes {
  // A whole turn.
  turnMs: number;
  // What's left of the turn now.
  leftMs: number;
}

// How long the clock runs after a move. A new turn gets the whole time; a new step in the same turn
// keeps what's left of it, but at least `stepMinMs`, so a turn can't stretch to twice its time.
export const turnClockMs = (events: readonly RoundEvent[], { turnMs, leftMs }: TurnClockTimes): number =>
  events.some((event) => event.type === 'turn') ? turnMs : Math.max(leftMs, stepMinMs);
