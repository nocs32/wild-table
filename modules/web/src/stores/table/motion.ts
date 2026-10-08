import type { TableCardSpot } from './body';

// The deck's moves, worked out: how fast the pointer was going, where the halves of a riffle go,
// and the order they fall back in.

export interface TableDeckSample {
  x: number;
  z: number;
  at: number;
}

// The pointer's speed over its last few samples, in table units a second.
export const velocityOf = (samples: readonly TableDeckSample[]): { x: number; z: number } => {
  const first = samples[0];
  const last = samples.at(-1);

  if (!first || !last || last.at - first.at < 12) return { x: 0, z: 0 };

  const seconds = (last.at - first.at) / 1000;

  return { x: (last.x - first.x) / seconds, z: (last.z - first.z) / seconds };
};

// The deck split for a riffle: the bottom half to the left, the top half to the right, each
// leaning in towards the other.
export const spreadSpot = (slot: number, half: number, centre: { x: number; z: number }, thickness: number): TableCardSpot => {
  const isTop = slot >= half;
  const level = isTop ? slot - half : slot;

  return { x: centre.x + (isTop ? 0.2 : -0.2), y: thickness * (level + 0.5) + 0.04, z: centre.z + (isTop ? 0.03 : -0.03), yaw: isTop ? 0.16 : -0.16, flip: 0 };
};

// The halves fall back together a card or two at a time from each side, like thumbs letting go.
export const riffleOrder = (order: readonly number[], random: () => number): number[] => {
  const half = Math.ceil(order.length / 2);
  const left = order.slice(0, half);
  const right = order.slice(half);
  const out: number[] = [];

  while (left.length > 0 || right.length > 0) {
    const fromLeft = right.length === 0 || (left.length > 0 && random() < 0.5);
    const source = fromLeft ? left : right;
    const take = Math.min(source.length, random() < 0.7 ? 1 : 2);

    out.push(...source.splice(0, take));
  }

  return out;
};
