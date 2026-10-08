import { Spring } from '../../../utils/spring';
import { cardSize } from '../body';

const cardHalfDepth = cardSize.depth / 2;

// Where a card in the round is headed, and how it's turned (spec §8.3). Table units, the felt at
// y = 0. `pitch` tilts it towards you (your hand faces the camera), `yaw` turns it on the table,
// `roll` leans it sideways; `flip` is 0 face down, 1 face up.
export interface RoundSpot {
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  roll: number;
  flip: number;
  scale: number;
}

// One card in the round, moved every frame by springs: plain numbers, not MobX, so the render loop
// reads them straight from here (spec §8.3). A new spot is picked up from wherever the card is,
// at whatever speed, so nothing ever jumps (D24).
export class TableRoundBody {
  readonly x: Spring;
  readonly y: Spring;
  readonly z: Spring;
  readonly pitch: Spring;
  readonly yaw: Spring;
  readonly roll: Spring;
  readonly flip: Spring;
  readonly scale: Spring;
  // A head-shake for a card that can't be played (spec §8.2).
  readonly shake = new Spring(0, 420, 9);
  // When it last landed on the pile, and how hard (0 to 1): the slap (D25).
  landedAt = -1;
  impact = 0;
  // Headed for the pile and not landed yet, with this strength.
  landing: number | null = null;
  // Moving in slow motion until then (the round's winning card).
  #slowUntil = -1;

  constructor(spot: RoundSpot) {
    this.x = new Spring(spot.x, 150, 21);
    // Never overshoots downwards: a card settling on the pile mustn't dip into the cards under it.
    this.y = new Spring(spot.y, 150, 26);
    this.z = new Spring(spot.z, 150, 21);
    this.pitch = new Spring(spot.pitch, 150, 22);
    this.yaw = new Spring(spot.yaw, 150, 22);
    this.roll = new Spring(spot.roll, 220, 18);
    this.flip = new Spring(spot.flip, 110, 17);
    this.scale = new Spring(spot.scale, 200, 22);
  }

  get speed(): number {
    return Math.hypot(this.x.velocity, this.y.velocity, this.z.velocity);
  }

  to(spot: RoundSpot): void {
    this.x.target = spot.x;
    this.y.target = spot.y;
    this.z.target = spot.z;
    this.pitch.target = spot.pitch;
    this.yaw.target = spot.yaw;
    this.roll.target = spot.roll;
    this.flip.target = spot.flip;
    this.scale.target = spot.scale;
  }

  // Off to the pile, already moving at `velocity` (a throw), to land with `strength`.
  launch(velocity: { x: number; y: number; z: number }, strength: number): void {
    this.x.velocity = velocity.x;
    this.y.velocity = Math.max(0, velocity.y);
    this.z.velocity = velocity.z;
    this.landing = strength;
  }

  // On its way to the pile, a card stays above it until it's over it, then comes down on top: it
  // never cuts through the cards already there.
  arcOver(spot: RoundSpot): RoundSpot {
    // A card still tilted (from your hand, or leaning as it flies) has an edge lower than its middle.
    const tilt = (Math.abs(Math.sin(this.pitch.value)) + Math.abs(Math.sin(this.roll.value))) * cardHalfDepth * this.scale.value;

    if (this.landing === null) return tilt > 0.002 ? { ...spot, y: spot.y + tilt } : spot;

    const away = Math.hypot(this.x.value - spot.x, this.z.value - spot.z);

    // Clear of the pile until it's nearly over it, then straight down: a quick, solid slap.
    return { ...spot, y: spot.y + (away > 0.06 ? Math.min(0.25, away * 0.45) : 0) + tilt };
  }

  // Shaking its head: no. It's not landing anywhere, nor in slow motion any more.
  refuse(): void {
    this.shake.velocity += 9;
    this.landing = null;
    this.#slowUntil = -1;
  }

  slowMo(until: number): void {
    this.#slowUntil = until;
  }

  step(dt: number, now: number): void {
    const time = now < this.#slowUntil ? dt * 0.28 : dt;

    [this.x, this.y, this.z, this.pitch, this.yaw, this.roll, this.flip, this.scale, this.shake].forEach((spring) => spring.step(time));
    this.#land(now);
  }

  // The moment it reaches the pile: the slap.
  #land(now: number): void {
    if (this.landing === null) return;

    const close = Math.hypot(this.x.value - this.x.target, this.z.value - this.z.target) < 0.06 && this.y.value - this.y.target < 0.012;

    if (!close) return;

    this.landedAt = now;
    this.impact = this.landing;
    this.landing = null;
  }
}
