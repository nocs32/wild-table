// The answers within a turn: picking the colour after a wild, taking or challenging a +4, and
// keeping a drawn card (spec §5.3–§5.5).
import type { CardColour } from '@wild-table/protocol';
import { hitNext, takeTheCards } from './play.js';
import { drawCards, handOf, passTurn, stepError, topCard } from './table.js';
import type { MoveError, RoundContext, SeatId } from './types.js';

export const pickColour = (context: RoundContext, seat: SeatId, colour: CardColour): MoveError | null => {
  const { state } = context;
  const error = stepError(context, seat, 'pickColour');

  if (error) return error;

  state.colour = colour;
  context.events.push({ type: 'colour', seat, colour });

  // A wild turned up to start the round: the first player picks, then plays (spec §5.2).
  if (state.step.kind === 'pickColour' && state.step.opening) {
    state.step = { kind: 'play' };
    context.events.push({ type: 'turn', seat });
  } else if (topCard(state).kind === 'wild4') {
    // The victim may challenge (unless "+4 any time" is on) or stack another +4 (stacking).
    hitNext(context, seat, (victim) => !state.rules.wild4AnyTime || (state.rules.stacking && handOf(state, victim).some((card) => card.kind === 'wild4')));
  } else {
    passTurn(context, seat);
  }

  return null;
};

export const takeCards = (context: RoundContext, seat: SeatId): MoveError | null => {
  const error = stepError(context, seat, 'answer');

  if (error) return error;

  takeTheCards(context, seat);

  return null;
};

// Challenging a +4 (spec §5.5): the challenger sees the hand. A bluff costs its player the cards
// instead; a fair +4 costs the challenger two more, and their turn.
export const challenge = (context: RoundContext, seat: SeatId): MoveError | null => {
  const { state } = context;
  const error = stepError(context, seat, 'answer');
  const wild4 = state.wild4;

  if (error) return error;

  if (!wild4 || state.rules.wild4AnyTime || topCard(state).kind !== 'wild4') return 'WRONG_STEP';

  context.events.push({ type: 'challenged', seat, against: wild4.seat, bluff: wild4.bluff, hand: wild4.hand });
  state.wild4 = null;

  if (wild4.bluff) {
    drawCards(context, wild4.seat, state.pendingDraw, 'challenge');
    state.pendingDraw = 0;
    state.step = { kind: 'play' };
    context.events.push({ type: 'turn', seat });

    return null;
  }

  drawCards(context, seat, state.pendingDraw + 2, 'challenge');
  state.pendingDraw = 0;
  context.events.push({ type: 'skipped', seat });
  passTurn(context, seat);

  return null;
};

export const keepDrawn = (context: RoundContext, seat: SeatId): MoveError | null => {
  const error = stepError(context, seat, 'drawn');

  if (error) return error;

  context.events.push({ type: 'kept', seat });
  passTurn(context, seat);

  return null;
};
