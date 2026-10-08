import { makeAutoObservable } from 'mobx';
import type { RoomGameCaptionsStore } from '../../room/game/captions';
import type { RoomGameHandStore } from '../../room/game/hand';
import { velocityOf, type TableDeckSample } from '../motion';
import type { TableRoundBody } from './body';
import { pileSpot } from './layout';

export interface TableRoundHandDeps {
  hand: RoomGameHandStore;
  captions: RoomGameCaptionsStore;
  body: (cardId: string) => TableRoundBody | null;
  // Sends a card to the pile: off to the table, and flying there at once. False if it can't go.
  play: (cardId: string, velocity: { x: number; y: number; z: number }, strength: number) => boolean;
}

// idle → pressing (a card is pressed) → holding (dragged a few pixels) → idle (let go: played, or
// back into the hand). A click instead: selected (lifted, waiting for a second click or a click on
// the pile) → idle (played, or another click elsewhere). Spec §8.2, D23.
export type TableRoundHandState = 'idle' | 'pressing' | 'holding' | 'selected';

interface TableRoundPress {
  id: string;
  screenX: number;
  screenY: number;
  samples: TableDeckSample[];
  // The spot on the felt under the pointer: where a card let go lands.
  felt: { x: number; z: number } | null;
}

// How high a held card floats over the felt: the pointer drags it along this height.
export const roundHoldHeight = 0.36;
const dragThreshold = 6;
// Let go faster than this (table units a second), headed for the pile, and the card flies there.
const throwSpeed = 0.9;
const pileReach = 0.42;

// Your hand under the pointer (spec §8.2): hover a card and it rises; drag it to the pile, or throw
// it there; or click it, and click again (or click the pile) to play it. A card that can't be played
// shakes its head and says why (D7). The cards' moves are the round store's; this is the gesture.
export class TableRoundHandStore {
  state: TableRoundHandState = 'idle';
  hoveredId: string | null = null;
  selectedId: string | null = null;
  heldId: string | null = null;
  #press: TableRoundPress | null = null;
  readonly #deps: TableRoundHandDeps;

  constructor(deps: TableRoundHandDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isDragging(): boolean {
    return this.state === 'holding';
  }

  hover(id: string | null, index: number | null): void {
    this.hoveredId = id;
    this.#deps.hand.hover(index);
  }

  press(id: string, screenX: number, screenY: number): void {
    if (this.state === 'pressing' || this.state === 'holding') return;

    this.state = 'pressing';
    this.#press = { id, screenX, screenY, samples: [], felt: null };
  }

  move(screenX: number, screenY: number, point: { x: number; z: number } | null, now: number, felt: { x: number; z: number } | null): void {
    const press = this.#press;

    if (!press) return;

    press.felt = felt;

    if (this.state === 'pressing' && Math.hypot(screenX - press.screenX, screenY - press.screenY) > dragThreshold) this.#pickUp(press.id);

    if (this.state !== 'holding' || !point) return;

    press.samples = [...press.samples, { ...point, at: now }].filter((sample) => now - sample.at < 110);

    const body = this.#deps.body(press.id);
    const speed = velocityOf(press.samples);

    if (!body) return;

    body.x.target = point.x;
    body.z.target = point.z;
    body.y.target = roundHoldHeight;
    body.scale.target = 1;
    body.roll.target = Math.max(-0.5, Math.min(0.5, -speed.x * 0.14));
    body.pitch.target = Math.max(-0.4, Math.min(0.6, 0.35 + speed.z * 0.12));
  }

  release(): void {
    const press = this.#press;

    this.#press = null;

    if (!press) return;

    if (this.state === 'pressing') this.#click(press.id);
    else this.#letGo(press);
  }

  // A click on the pile plays the card you picked.
  clickPile(): void {
    if (this.state === 'selected' && this.selectedId) this.#tryPlay(this.selectedId, { x: 0, y: 1.2, z: -1 }, 0.5);
  }

  // A click anywhere else puts it back.
  deselect(): void {
    if (this.state !== 'selected') return;

    this.state = 'idle';
    this.selectedId = null;
  }

  #pickUp(id: string): void {
    this.state = 'holding';
    this.heldId = id;
    this.selectedId = null;
  }

  #click(id: string): void {
    if (this.selectedId === id) {
      this.#tryPlay(id, { x: 0, y: 1.2, z: -1 }, 0.5);

      return;
    }

    if (!this.#deps.hand.canPlay(id)) {
      this.state = 'idle';
      this.selectedId = null;
      this.#refuse(id);

      return;
    }

    this.state = 'selected';
    this.selectedId = id;
  }

  // Over the pile, or thrown at it: played, as hard as it was thrown. Anywhere else: back to the hand.
  #letGo(press: TableRoundPress): void {
    const speed = velocityOf(press.samples);
    const body = this.#deps.body(press.id);
    // Where the pointer let go, on the felt: the card itself may still be catching up.
    const at = press.felt ?? { x: body?.x.target ?? 0, z: body?.z.target ?? 0 };
    const headed = { x: at.x + speed.x * 0.3, z: at.z + speed.z * 0.3 };
    const fast = Math.hypot(speed.x, speed.z);
    const onPile = Math.hypot(at.x - pileSpot.x, at.z - pileSpot.z) < pileReach || (fast > throwSpeed && Math.hypot(headed.x - pileSpot.x, headed.z - pileSpot.z) < pileReach * 1.4);

    this.state = 'idle';
    this.heldId = null;

    if (onPile) this.#tryPlay(press.id, { x: speed.x, y: 0, z: speed.z }, Math.min(1, Math.max(0.15, (fast - 0.2) / 5)));
  }

  #tryPlay(id: string, velocity: { x: number; y: number; z: number }, strength: number): void {
    this.state = 'idle';
    this.selectedId = null;
    this.heldId = null;

    if (!this.#deps.play(id, velocity, strength)) this.#refuse(id);
  }

  #refuse(id: string): void {
    this.#deps.body(id)?.refuse();
    this.#deps.captions.why(this.#deps.hand.whyNot(id));
  }
}
