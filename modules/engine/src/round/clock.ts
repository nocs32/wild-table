// The turn's clock (spec D11) and the Last card! race's beat (§5.6), shared by the server and the
// demo table so both keep the same time.
import type { Move, RoundEvent, RoundState, SeatId } from './types.js';

// A new step within a turn (play or keep a drawn card, pick the colour, pick whose hand to swap
// with) gets at least this long, even when the turn's time is nearly out.
export const stepMinMs = 8000;

export interface TurnClockTimes {
  // A whole turn.
  turnMs: number;
  // What's left of the turn now.
  leftMs: number;
  // What's left of a race's beat, which holds the next turn back.
  beatMs: number;
}

// How long the clock runs after a move, or null to leave it be (a bell changes nothing). A new turn
// gets the whole time, plus the beat; a new step in the same turn keeps what's left of it, but at
// least `stepMinMs`, so a turn can't stretch to twice its time.
export const turnClockMs = (events: readonly RoundEvent[], wasBell: boolean, { turnMs, leftMs, beatMs }: TurnClockTimes): number | null => {
  if (wasBell) return null;

  return events.some((event) => event.type === 'turn') ? turnMs + beatMs : Math.max(leftMs, stepMinMs);
};

// While a race's beat holds the table and the race is still open, nobody but the player racing may
// play (a jump-in waits too), and the next player may not draw: the race gets its chance (§5.6).
export const heldByBeat = (state: RoundState, seat: SeatId, move: Move): boolean =>
  state.race !== null && ((move.type === 'play' && seat !== state.race) || (move.type === 'draw' && seat === state.turn));
