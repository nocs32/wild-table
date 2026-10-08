// The Last card! bell (spec §5.6). While someone is down to one card, the first to hit it wins
// the race: that player is safe, or anyone else catches them and they draw 2. On your turn, holding
// two cards, you may hit it early and play.
import { drawCards, handOf } from './table.js';
import type { MoveError, RoundContext, RoundState, SeatId } from './types.js';

export const caughtPenalty = 2;

// On your turn, holding two cards, you may hit the bell before you play, once: then no race opens
// when you drop to one. The call lasts until your turn ends.
export const canCallEarly = (state: RoundState, seat: SeatId): boolean =>
  seat === state.turn && state.step.kind === 'play' && handOf(state, seat).length === 2 && state.earlyCall !== seat;

export const ringBell = (context: RoundContext, seat: SeatId): MoveError | null => {
  const { state } = context;
  const racer = state.race;

  if (racer !== null) {
    state.race = null;

    if (racer === seat) {
      context.events.push({ type: 'bell', seat, result: 'safe', caught: null });
    } else {
      context.events.push({ type: 'bell', seat, result: 'caught', caught: racer });
      drawCards(context, racer, caughtPenalty, 'caught');
    }

    return null;
  }

  if (canCallEarly(state, seat)) {
    state.earlyCall = seat;
    context.events.push({ type: 'bell', seat, result: 'early', caught: null });

    return null;
  }

  return 'NO_RACE';
};
