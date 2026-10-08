import type { CardFace } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import { TableRoundBody, type RoundSpot } from './body';

// Where a card in the round is: in your hand, in someone else's (`seat`), or on the pile.
export type RoundPlace = { kind: 'hand' } | { kind: 'seat'; seat: string } | { kind: 'pile' };

// A card on the table as React draws it: its key and its face (null while only its back shows).
export interface RoundCardView {
  key: string;
  face: CardFace | null;
}

interface RoundCard {
  place: RoundPlace;
  face: CardFace | null;
  body: TableRoundBody;
}

// The pile keeps its top dozen or so cards on the table; the ones under them go.
const pileKept = 16;

// Every card on the round's table, by key: your cards and the pile's by card id, the others' backs
// by seat and a running number. `views` is all React sees (which cards exist, and their faces); the
// places and bodies are read every frame, outside React (spec §8.3).
export class TableRoundCardsStore {
  views: RoundCardView[] = [];
  readonly #cards = new Map<string, RoundCard>();
  // Your hand, the pile (bottom first) and the others' hands, in order.
  #hand: string[] = [];
  #pile: string[] = [];
  readonly #seats = new Map<string, string[]>();
  #next = 0;

  constructor() {
    // Only `views` is observable: the rest is read every frame.
    makeAutoObservable(this, { hand: false, pile: false, seatIds: false }, { autoBind: true });
  }

  get hand(): readonly string[] {
    return this.#hand;
  }

  get pile(): readonly string[] {
    return this.#pile;
  }

  seat(seat: string): readonly string[] {
    return this.#seats.get(seat) ?? [];
  }

  get seatIds(): string[] {
    return [...this.#seats.keys()];
  }

  has(key: string): boolean {
    return this.#cards.has(key);
  }

  body(key: string): TableRoundBody | null {
    return this.#cards.get(key)?.body ?? null;
  }

  placeOf(key: string): RoundPlace | null {
    return this.#cards.get(key)?.place ?? null;
  }

  faceOf(key: string): CardFace | null {
    return this.#cards.get(key)?.face ?? null;
  }

  // A new card, starting from `from` (the top of the deck, usually).
  add(key: string, face: CardFace | null, place: RoundPlace, from: RoundSpot): void {
    this.#cards.set(key, { place, face, body: new TableRoundBody(from) });
    this.#enter(key, place);
    this.#refresh();
  }

  // A back for `seat`'s hand, with a key of its own.
  addBack(seat: string, from: RoundSpot): string {
    const key = `${seat}#${this.#next++}`;

    this.add(key, null, { kind: 'seat', seat }, from);

    return key;
  }

  // Moves a card to another place, and (to turn a back into the card it was) another key and face.
  // The body comes along, so it keeps moving from wherever it is.
  move(key: string, place: RoundPlace, as: { key: string; face: CardFace | null } = { key, face: this.faceOf(key) }): void {
    const card = this.#cards.get(key);

    if (!card) return;

    this.#leave(key, card.place);
    this.#cards.delete(key);
    this.#cards.set(as.key, { place, face: as.face, body: card.body });
    this.#enter(as.key, place);
    this.#refresh();
  }

  // Shows a back's face (every hand turns face up at the end of a round), or hides it again.
  reveal(key: string, face: CardFace | null): void {
    const card = this.#cards.get(key);

    if (!card || card.face === face) return;

    card.face = face;
    this.#refresh();
  }

  remove(key: string): void {
    const card = this.#cards.get(key);

    if (!card) return;

    this.#leave(key, card.place);
    this.#cards.delete(key);
    this.#refresh();
  }

  // Your hand in the order it's shown.
  orderHand(ids: readonly string[]): void {
    this.#hand = [...ids.filter((id) => this.#hand.includes(id)), ...this.#hand.filter((id) => !ids.includes(id))];
  }

  clear(): void {
    this.#cards.clear();
    this.#seats.clear();
    this.#hand = [];
    this.#pile = [];
    this.#refresh();
  }

  #enter(key: string, place: RoundPlace): void {
    if (place.kind === 'hand') this.#hand = [...this.#hand, key];
    else if (place.kind === 'pile') this.#pile = [...this.#pile, key];
    else this.#seats.set(place.seat, [...(this.#seats.get(place.seat) ?? []), key]);

    if (this.#pile.length > pileKept) this.#pile.slice(0, this.#pile.length - pileKept).forEach((old) => this.remove(old));
  }

  #leave(key: string, place: RoundPlace): void {
    if (place.kind === 'hand') this.#hand = this.#hand.filter((other) => other !== key);
    else if (place.kind === 'pile') this.#pile = this.#pile.filter((other) => other !== key);
    else this.#seats.set(place.seat, (this.#seats.get(place.seat) ?? []).filter((other) => other !== key));
  }

  #refresh(): void {
    this.views = [...this.#cards.entries()].map(([key, card]) => ({ key, face: card.face }));
  }
}
