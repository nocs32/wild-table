import { createDeck, shuffle } from '@wild-table/engine';
import type { CardFace } from '@wild-table/protocol';
import { makeAutoObservable, runInAction } from 'mobx';
import type { Schedule, SoundsService } from '../../services';
import { cardSize, TableCardBody, type TableCardSpot } from './body';
import { riffleOrder, spreadSpot, velocityOf, type TableDeckSample } from './motion';

export interface TableDeckDeps {
  random: () => number;
  schedule: Schedule;
  sounds: SoundsService;
}

// idle → pressing (a card is pressed) → holding (dragged a few pixels) → idle (let go: thrown or
// dropped). A click on the deck: gathering (cards on the felt fly home) → shuffling → idle.
export type TableDeckState = 'idle' | 'pressing' | 'holding' | 'gathering' | 'shuffling';

const deckSize = 24;
const deckSpot = { x: 0, z: -0.04 };
// How high a held card floats over the felt: the pointer drags it along this height.
export const holdHeight = 0.32;
// Pixels the pointer moves before a press becomes a drag.
const dragThreshold = 6;
// Faster than this (table units a second) on letting go, and the card flies.
const throwSpeed = 0.8;

interface TableDeckPress {
  id: number;
  screenX: number;
  screenY: number;
  samples: TableDeckSample[];
}

// The deck in the middle of the lobby's table (spec §4.2, §8.2): something to play with while
// people gather, and the first feel of the cards. Click it to shuffle; grab a card to lift it, and
// throw it to send it sliding across the felt, face up, with a slap. The state machine lives here;
// the cards' positions are per-frame data in `bodies`.
export class TableDeckStore {
  state: TableDeckState = 'idle';
  // Each card's face, by card; only seen once a card is turned over.
  faces: CardFace[];
  // The cards in the deck, bottom first. The rest are on the felt or in a hand.
  order: number[];
  hoveredId: number | null = null;
  // Has anyone played with it yet? The hint stays until they have.
  hasPlayed = false;
  readonly bodies: TableCardBody[];
  #press: TableDeckPress | null = null;
  #landings = 0;
  // The last landing heard, so each slap sounds once.
  #heardAt = -1;
  #plans: Array<() => void> = [];
  readonly #deps: TableDeckDeps;

  constructor(deps: TableDeckDeps) {
    this.#deps = deps;
    this.faces = this.#dealFaces();
    this.order = Array.from({ length: deckSize }, (_, id) => id);
    this.bodies = this.order.map((_, slot) => new TableCardBody(this.#slotSpot(slot)));
    makeAutoObservable(this, { bodies: false, step: false }, { autoBind: true });
  }

  get topId(): number | null {
    return this.order.at(-1) ?? null;
  }

  get isBusy(): boolean {
    return this.state === 'gathering' || this.state === 'shuffling';
  }

  get cursor(): 'grab' | 'grabbing' | 'auto' {
    if (this.state === 'holding' || this.state === 'pressing') return 'grabbing';

    return this.hoveredId !== null && !this.isBusy ? 'grab' : 'auto';
  }

  isInDeck(id: number): boolean {
    return this.order.includes(id);
  }

  hover(id: number | null): void {
    this.hoveredId = id;
  }

  // Pressing anywhere on the deck presses its top card.
  press(id: number, screenX: number, screenY: number): void {
    if (this.state !== 'idle') return;

    this.state = 'pressing';
    this.#press = { id: this.isInDeck(id) ? (this.topId ?? id) : id, screenX, screenY, samples: [] };
  }

  move(screenX: number, screenY: number, point: { x: number; z: number } | null, now: number): void {
    const press = this.#press;

    if (!press) return;

    if (this.state === 'pressing' && Math.hypot(screenX - press.screenX, screenY - press.screenY) > dragThreshold) this.#pickUp(press.id);

    if (this.state !== 'holding' || !point) return;

    press.samples = [...press.samples, { ...point, at: now }].filter((sample) => now - sample.at < 110);

    const speed = velocityOf(press.samples);

    this.bodies[press.id]?.hold(point.x, point.z, holdHeight, speed.x, speed.z);
  }

  // A click shuffles the deck, or turns over a card on the felt; a drag throws or drops the card.
  release(): void {
    const press = this.#press;

    this.#press = null;

    if (!press) return;

    if (this.state === 'pressing') {
      this.state = 'idle';

      if (this.isInDeck(press.id)) this.shuffle();
      else this.#turnOver(press.id);

      return;
    }

    this.state = 'idle';
    this.#letGo(press);
  }

  shuffle(): void {
    if (this.state !== 'idle') return;

    const strays = this.bodies.map((_, id) => id).filter((id) => !this.isInDeck(id));

    this.hasPlayed = true;

    if (strays.length === 0) {
      this.#riffle();

      return;
    }

    this.state = 'gathering';
    strays.forEach((id, index) => this.#later(index * 45, () => this.#gather(id)));
    this.#later(strays.length * 45 + 420, () => this.#riffle());
  }

  // Every frame: not an action, it only moves the cards. A card that slid to a stop over the deck
  // rises to lie on top of it.
  step(dt: number, now: number): void {
    const deckTop = cardSize.thickness * (this.order.length + 1.5);

    this.bodies.forEach((body, id) => {
      body.step(dt, now);
      this.#hear(body.landedAt, body.impact);

      if (body.mode === 'felt' && body.y.target < deckTop && !this.order.includes(id) && this.#isOverDeck(body.x.value, body.z.value)) body.y.target = deckTop;
    });
  }

  dispose(): void {
    this.#plans.forEach((cancel) => cancel());
    this.#plans = [];
  }

  // A thrown card's slap, as loud and as bright as it was hard (D25).
  #hear(landedAt: number, impact: number): void {
    if (landedAt <= this.#heardAt) return;

    this.#heardAt = landedAt;
    this.#deps.sounds.play('slap', { level: 0.3 + impact * 0.7, rate: 0.9 + impact * 0.2 });
  }

  #pickUp(id: number): void {
    this.state = 'holding';
    this.hasPlayed = true;
    this.order = this.order.filter((other) => other !== id);
  }

  #letGo(press: TableDeckPress): void {
    const body = this.bodies[press.id];
    const speed = velocityOf(press.samples);

    if (!body) return;

    if (Math.hypot(speed.x, speed.z) > throwSpeed) body.throw(speed.x * 1.15, speed.z * 1.15, this.#landingHeight(false));
    else body.rest({ x: body.x.value, y: this.#landingHeight(this.#isOverDeck(body.x.value, body.z.value)), z: body.z.value, yaw: body.yaw.value, flip: 1 }, 'felt');
  }

  // Each card that lands lies a hair above the one before, so they never cut into each other; one
  // dropped on the deck lies on top of it.
  #landingHeight(onDeck: boolean): number {
    const base = onDeck ? cardSize.thickness * this.order.length : 0;

    return base + cardSize.thickness * (1.5 + (this.#landings++ % 40));
  }

  #isOverDeck(x: number, z: number): boolean {
    return Math.abs(x - deckSpot.x) < cardSize.width * 0.8 && Math.abs(z - deckSpot.z) < cardSize.depth * 0.8;
  }

  #turnOver(id: number): void {
    const body = this.bodies[id];

    if (body) body.flip.target = body.flip.target > 0.5 ? 0 : 1;
  }

  #gather(id: number): void {
    this.order = [...this.order, id];
    this.bodies[id]?.rest(this.#slotSpot(this.order.length - 1), 'deck');
  }

  // A riffle: the deck splits in two, then the halves fall back together, interleaved.
  #riffle(): void {
    const half = Math.ceil(this.order.length / 2);
    const next = riffleOrder(this.order, this.#deps.random);

    this.state = 'shuffling';
    this.#later(330, () => this.#deps.sounds.play('shuffle'));
    this.order.forEach((id, slot) => this.bodies[id]?.rest(spreadSpot(slot, half, deckSpot, cardSize.thickness), 'deck'));
    next.forEach((id, slot) => this.#later(380 + slot * 26, () => this.bodies[id]?.rest(this.#slotSpot(slot), 'deck')));
    this.#later(380 + next.length * 26 + 320, () => this.#settle(next));
  }

  #settle(order: number[]): void {
    this.order = order;
    this.faces = this.#dealFaces();
    this.state = 'idle';
  }

  // Runs `action` later, as an action of its own (MobX's strict mode).
  #later(delayMs: number, action: () => void): void {
    this.#plans = [...this.#plans, this.#deps.schedule(() => runInAction(action), delayMs)];
  }

  #dealFaces(): CardFace[] {
    return shuffle(createDeck(), this.#deps.random).slice(0, deckSize);
  }

  // A slot in the deck: stacked up, each a hair out of line, like a real deck.
  #slotSpot(slot: number): TableCardSpot {
    const wobble = (seed: number): number => Math.sin(slot * 12.9898 + seed * 78.233) * 0.5;

    return { x: deckSpot.x + wobble(1) * 0.012, y: cardSize.thickness * (slot + 0.5), z: deckSpot.z + wobble(2) * 0.012, yaw: wobble(3) * 0.07, flip: 0 };
  }
}
