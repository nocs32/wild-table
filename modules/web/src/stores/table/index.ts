import type { HouseRule } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../services';
import type { Translate } from '../locale';
import { TableDeckStore } from './deck';

export interface TableDeps {
  t: Translate;
  random: () => number;
  schedule: Schedule;
}

// What the pointer is over on the table.
export type TableHover = { kind: 'card'; id: number } | { kind: 'leaflet' } | { kind: 'tent'; rule: HouseRule; name: string };

// What happens on the 3D table itself, in this browser: the deck to play with in the lobby, what
// the pointer is over (for the cursor and a tooltip saying what a click does, spec D7), and how far
// the lobby's side panels cover the table, so the camera frames what's left.
export class TableStore {
  readonly deck: TableDeckStore;
  hovered: TableHover | null = null;
  // Pixels of the table covered by the lobby's cards on the left and on the right.
  insetLeft = 0;
  insetRight = 0;
  readonly #t: Translate;

  constructor(deps: TableDeps) {
    this.#t = deps.t;
    this.deck = new TableDeckStore(deps);
    makeAutoObservable(this, { deck: false }, { autoBind: true });
  }

  get cursor(): string {
    if (this.hovered?.kind === 'card' || this.deck.state !== 'idle') return this.deck.cursor;

    return this.hovered ? 'pointer' : 'auto';
  }

  // The canvas's tooltip: what a click on the thing under the pointer does.
  get hint(): string {
    const hovered = this.hovered;

    if (!hovered || this.deck.state !== 'idle') return '';

    if (hovered.kind === 'leaflet') return this.#t('table.leafletHint');

    if (hovered.kind === 'tent') return this.#t('table.tentHint', { rule: hovered.name });

    return this.deck.isInDeck(hovered.id) ? this.#t('table.deckHint') : this.#t('table.cardHint');
  }

  hover(target: TableHover | null): void {
    this.hovered = target;
    this.deck.hover(target?.kind === 'card' ? target.id : null);
  }

  // Leaving one thing: only clears the hover if it's still that thing (the pointer may already be
  // over the next card).
  leave(left: TableHover): void {
    const hovered = this.hovered;

    if (!hovered || hovered.kind !== left.kind) return;

    if (hovered.kind === 'card' && left.kind === 'card' && hovered.id !== left.id) return;

    if (hovered.kind === 'tent' && left.kind === 'tent' && hovered.rule !== left.rule) return;

    this.hover(null);
  }

  setInsets(left: number, right: number): void {
    this.insetLeft = Math.max(0, Math.round(left));
    this.insetRight = Math.max(0, Math.round(right));
  }
}
