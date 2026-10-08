import type { RoundEvent } from '@wild-table/engine';
import type { PlayEvent, TablePeekEvent } from '@wild-table/protocol';

// A peek, and who may see it.
export interface TableRoomPeek {
  to: string;
  event: TablePeekEvent;
}

export interface TableRoomSortedEvents {
  played: PlayEvent[];
  peeks: TableRoomPeek[];
}

// The engine's events, split into what everyone may see and what's private (spec D13, §10.4):
// drawn cards become a count (their faces reach the drawer in their hand), and a challenged hand
// goes to the challenger alone. Whose turn it is travels in the view.
export const sortEvents = (events: readonly RoundEvent[], strength: number, handSize: number): TableRoomSortedEvents =>
  events.reduce<TableRoomSortedEvents>(
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
