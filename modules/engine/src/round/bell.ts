// The Last card! bell (spec §5.6): a block, not a race. While anyone else is down to one card, the
// player whose turn it is may hit it instead of playing: everyone else on one card draws 2, the
// ringer draws 1, and the turn passes. A sacrifice to stop whoever's about to win, once a round
// each. It's always your own move, on your own turn, so nobody wins it by being quicker (a tap
// beats a mouse).
import { drawCards, handOf, passTurn } from './table.js';
import type { MoveError, RoundContext, RoundState, SeatId } from './types.js';

// What the bell costs: the cards each player on one card draws, and the ringer's own.
export const bellPenalty = 2;
export const bellCost = 1;

// Who a ring would hit: everyone else down to one card.
export const bellTargets = (state: RoundState, seat: SeatId): SeatId[] => state.seats.filter((other) => other !== seat && handOf(state, other).length === 1);

// On your turn, before you play or draw, when someone else is down to one card, if you haven't
// rung it yet this round.
export const canRingBell = (state: RoundState, seat: SeatId): boolean =>
  seat === state.turn && state.step.kind === 'play' && !state.bellsRung.includes(seat) && bellTargets(state, seat).length > 0;

export const ringBell = (context: RoundContext, seat: SeatId): MoveError | null => {
  const { state } = context;

  if (seat !== state.turn) return 'NOT_YOUR_TURN';

  if (state.step.kind !== 'play') return 'WRONG_STEP';

  const hit = bellTargets(state, seat);

  if (state.bellsRung.includes(seat)) return 'BELL_USED';

  if (hit.length === 0) return 'NO_TARGET';

  state.bellsRung = [...state.bellsRung, seat];
  context.events.push({ type: 'bell', seat, hit });
  hit.forEach((target) => drawCards(context, target, bellPenalty, 'bell'));
  drawCards(context, seat, bellCost, 'bell');
  passTurn(context, seat);

  return null;
};
