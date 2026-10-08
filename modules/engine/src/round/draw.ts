// Drawing on your turn (spec §5.3): one card, or with the house rule, until one fits. A card that
// fits may be played straight away or kept.
import type { Card, DrawReason } from '@wild-table/protocol';
import { checkPlay } from '../plays.js';
import { takeTheCards } from './play.js';
import { giveCards, handOf, passTurn, takeFromDeck, topCard } from './table.js';
import type { MoveError, RoundContext, SeatId } from './types.js';

const fits = (context: RoundContext, seat: SeatId, card: Card): boolean => {
  const { state } = context;

  return checkPlay(card, { card: topCard(state), colour: state.colour }, handOf(state, seat), state.rules).fits;
};

const drawUntilFits = (context: RoundContext, seat: SeatId): Card[] => {
  const drawn: Card[] = [];

  for (;;) {
    const card = takeFromDeck(context);

    if (!card) return drawn;

    drawn.push(card);

    if (!context.state.rules.drawUntilPlayable || fits(context, seat, card)) return drawn;
  }
};

export const drawCard = (context: RoundContext, seat: SeatId, reason: DrawReason = 'draw'): MoveError | null => {
  const { state } = context;

  if (seat !== state.turn) return 'NOT_YOUR_TURN';

  // Hit by a +2 or +4: drawing means taking the cards.
  if (state.step.kind === 'answer') {
    takeTheCards(context, seat);

    return null;
  }

  if (state.step.kind !== 'play') return 'WRONG_STEP';

  const drawn = drawUntilFits(context, seat);
  const last = drawn.at(-1);

  giveCards(context, seat, drawn, reason);

  if (last && reason === 'draw' && fits(context, seat, last)) state.step = { kind: 'drawn', cardId: last.id };
  else passTurn(context, seat);

  return null;
};
