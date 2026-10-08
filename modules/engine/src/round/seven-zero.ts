// The 7-0 house rule (spec §5.7): a 7 swaps hands with a player you pick; a 0 passes every hand
// along in the direction of play.
import { handOf, passTurn, stepError } from './table.js';
import type { MoveError, RoundContext, SeatId } from './types.js';

export const swapHands = (context: RoundContext, seat: SeatId, target: SeatId): MoveError | null => {
  const { state } = context;
  const error = stepError(context, seat, 'swap');

  if (error) return error;

  if (target === seat || !state.seats.includes(target)) return 'NOT_A_SEAT';

  const mine = handOf(state, seat);

  state.hands[seat] = handOf(state, target);
  state.hands[target] = mine;
  context.events.push({ type: 'swapped', seat, with: target });
  passTurn(context, seat);

  return null;
};

// Each hand moves on to the next player in the direction of play.
export const passHands = (context: RoundContext): void => {
  const { state } = context;
  const count = state.seats.length;
  const before = state.seats.map((seat) => handOf(state, seat));

  state.seats.forEach((seat, index) => {
    state.hands[seat] = before[(index - state.direction + count) % count] ?? [];
  });

  context.events.push({ type: 'handsPassed', direction: state.direction });
};
