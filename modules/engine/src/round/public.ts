// What everyone may see of a round, and what's private (spec D13, §10.4). The server and the demo
// table's referee both send exactly this, so the browser can't tell them apart (D18).
import type { PlayEvent, RoundSnapshot, TablePeekEvent } from '@wild-table/protocol';
import { topCard } from './table.js';
import type { RoundEvent, RoundState, SeatId } from './types.js';

// A peek at a challenged hand, and who may see it.
export interface RoundPeek {
  to: SeatId;
  event: TablePeekEvent;
}

export interface PublicEvents {
  played: PlayEvent[];
  peeks: RoundPeek[];
}

// The engine's events, split: drawn cards become a count (their faces reach the drawer in their
// hand), and a challenged hand goes to the challenger alone. Whose turn it is travels in the view.
// `strength` is how hard a played card was thrown, for the slap everyone sees (D25).
export const publicEvents = (events: readonly RoundEvent[], strength: number, handSize: number): PublicEvents =>
  events.reduce<PublicEvents>(
    ({ played, peeks }, event) => {
      switch (event.type) {
        case 'turn':
          return { played, peeks };
        case 'flipped':
          return { played: [...played, { type: 'dealt', first: event.card, handSize }], peeks };
        case 'played':
          return { played: [...played, { ...event, strength }], peeks };
        case 'drew':
          return { played: [...played, { type: 'drew', seat: event.seat, count: event.cards.length, reason: event.reason }], peeks };
        case 'challenged':
          return {
            played: [...played, { type: 'challenged', seat: event.seat, against: event.against, bluff: event.bluff }],
            peeks: [...peeks, { to: event.seat, event: { seat: event.against, cards: event.hand } }],
          };
        default:
          return { played: [...played, event], peeks };
      }
    },
    { played: [], peeks: [] },
  );

// The round in progress, the same for everyone. `endsAt` is when the turn's time runs out.
export const roundSnapshot = (state: RoundState, endsAt: number): RoundSnapshot => ({
  top: topCard(state),
  colour: state.colour,
  turn: state.turn,
  step: state.step.kind,
  direction: state.direction,
  deckSize: state.deck.length,
  pendingDraw: state.pendingDraw,
  bellsRung: [...state.bellsRung],
  challengeColour: state.wild4 !== null && state.step.kind === 'answer' && topCard(state).kind === 'wild4' ? state.wild4.colour : null,
  endsAt,
});
