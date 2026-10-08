import { Spring } from '../../utils/spring';

// One card on the 3D table, moved every frame (spec §8.2, §8.3). Plain numbers, not MobX: the
// render loop reads them straight from here, outside React's renders. Table units: the felt's
// surface is y = 0, the card table is about 3.4 wide.
export const cardSize = { width: 0.3, depth: 0.42, thickness: 0.0045 };

// deck: in the deck, face down. held: following the pointer. flying: thrown, sliding across the
// felt. felt: lying where it stopped.
export type TableCardMode = 'deck' | 'held' | 'flying' | 'felt';

// Where thrown cards bounce: an ellipse a little inside the rail.
const bounds = { x: 1.38, z: 0.86 };
// How fast a sliding card slows down, per second.
const friction = 2.2;
const restSpeed = 0.05;
// How much of its speed a card keeps when it bounces off the rail.
const bounce = 0.55;

export interface TableCardSpot {
  x: number;
  y: number;
  z: number;
  yaw: number;
  // 0 face down, 1 face up.
  flip: number;
}

export class TableCardBody {
  mode: TableCardMode = 'deck';
  readonly x: Spring;
  readonly y: Spring;
  readonly z: Spring;
  readonly yaw: Spring;
  readonly flip = new Spring(0, 120, 16);
  // Leaning into the movement while held, like a card catching the air.
  readonly tiltX = new Spring(0, 220, 18);
  readonly tiltZ = new Spring(0, 220, 18);
  // Spin while sliding, in radians a second.
  spin = 0;
  // Where a sliding card comes to rest, height-wise: on top of whatever landed before it.
  restY = 0;
  // The moment it last hit the felt and how hard (0 to 1): the slap (spec D25).
  landedAt = -1;
  impact = 0;

  constructor(spot: TableCardSpot) {
    this.x = new Spring(spot.x, 260, 28);
    this.y = new Spring(spot.y, 260, 28);
    this.z = new Spring(spot.z, 260, 28);
    this.yaw = new Spring(spot.yaw, 160, 22);
    this.flip.snap(spot.flip);
  }

  // Springs over to a resting spot: a slot in the deck, or a place on the felt.
  rest(spot: TableCardSpot, mode: 'deck' | 'felt'): void {
    this.mode = mode;
    this.x.target = spot.x;
    this.y.target = spot.y;
    this.z.target = spot.z;
    this.yaw.target = spot.yaw;
    this.flip.target = spot.flip;
    this.tiltX.target = 0;
    this.tiltZ.target = 0;
  }

  // Follows the pointer at `height`, leaning the way it's moving.
  hold(x: number, z: number, height: number, vx: number, vz: number): void {
    this.mode = 'held';
    this.x.target = x;
    this.z.target = z;
    this.y.target = height;
    this.flip.target = 1;
    this.tiltZ.target = Math.max(-0.6, Math.min(0.6, -vx * 0.16));
    this.tiltX.target = Math.max(-0.6, Math.min(0.6, vz * 0.16));
  }

  // Let go while moving: it slides off at that speed, spinning a little, and lands at `restY`.
  throw(vx: number, vz: number, restY: number): void {
    this.mode = 'flying';
    this.landedAt = -1;
    this.x.velocity = vx;
    this.z.velocity = vz;
    this.spin = (vx - vz) * 1.4;
    this.restY = restY;
    this.y.target = restY;
    this.flip.target = 1;
    this.tiltX.target = 0;
    this.tiltZ.target = 0;
  }

  step(dt: number, now: number): void {
    if (this.mode === 'flying') this.#slide(dt, now);
    else {
      this.x.step(dt);
      this.z.step(dt);
    }

    this.y.step(dt);
    this.yaw.step(dt);
    this.flip.step(dt);
    this.tiltX.step(dt);
    this.tiltZ.step(dt);
  }

  // Sliding on the felt: friction, a bounce off the rail, and rest once it's slow.
  #slide(dt: number, now: number): void {
    const keep = Math.exp(-friction * Math.min(dt, 0.05));

    this.x.value += this.x.velocity * dt;
    this.z.value += this.z.velocity * dt;
    this.x.velocity *= keep;
    this.z.velocity *= keep;
    this.yaw.target += this.spin * dt;
    this.spin *= keep;
    this.#bounce();
    this.#land(now);

    if (Math.hypot(this.x.velocity, this.z.velocity) < restSpeed) {
      this.rest({ x: this.x.value, y: this.restY, z: this.z.value, yaw: this.yaw.target, flip: 1 }, 'felt');
    }
  }

  #bounce(): void {
    const reach = (this.x.value / bounds.x) ** 2 + (this.z.value / bounds.z) ** 2;

    if (reach <= 1) return;

    const scale = 1 / Math.sqrt(reach);
    // The ellipse's normal at this point, to reflect the speed off.
    const nx = this.x.value / bounds.x ** 2;
    const nz = this.z.value / bounds.z ** 2;
    const length = Math.hypot(nx, nz);
    const along = (this.x.velocity * nx + this.z.velocity * nz) / length;

    this.x.value *= scale;
    this.z.value *= scale;

    if (along > 0) {
      this.x.velocity = (this.x.velocity - (2 * along * nx) / length) * bounce;
      this.z.velocity = (this.z.velocity - (2 * along * nz) / length) * bounce;
    }
  }

  // The first moment it reaches the felt: how hard it slapped, from how fast it was going.
  #land(now: number): void {
    if (this.landedAt > 0 || this.y.value > this.restY + 0.02) return;

    this.landedAt = now;
    this.impact = Math.min(1, Math.hypot(this.x.velocity, this.z.velocity) / 6);
  }
}
