import { cardSize } from '../body';
import type { RoundSpot } from './body';

// Where each card in a round belongs (spec §8, §9): your hand fanned along the bottom of the screen
// facing you, the others' hands as backs at their places round the felt, the pile and the deck in
// the middle. Plain functions: the store asks them every frame.

export const pileSpot = { x: 0.2, z: -0.04 };
export const deckSpot = { x: -0.3, z: -0.04 };
// A card in the deck is thinner than a real one, so 108 of them still make a modest stack.
export const deckCardThickness = 0.0022;
// How far apart the cards on the pile lie in height.
const pileStep = cardSize.thickness * 1.05;

// The part of the view your hand sits in, worked out from the camera (see `useRoomTableHandFrame`):
// a plane in front of the camera near the bottom of the screen, facing it.
export interface HandFrame {
  origin: [number, number, number];
  right: [number, number, number];
  up: [number, number, number];
  // Towards the camera.
  out: [number, number, number];
  // The tilt that turns a card on the table to face the camera.
  pitch: number;
  // The width of the view at the hand's distance.
  width: number;
}

export const defaultHandFrame: HandFrame = { origin: [0, 0.9, 1.9], right: [1, 0, 0], up: [0, 0.82, -0.56], out: [0, 0.56, 0.82], pitch: 0.97, width: 2.4 };

// A number from 0 to 1 that's always the same for the same text: a card's own wobble on the pile.
const hash = (text: string): number => {
  let value = 2166136261;

  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);

  return ((value >>> 0) % 10_000) / 10_000;
};

// On the pile at a slight angle, a little out of line, like a real messy pile (spec §8.2).
export const pileCardSpot = (key: string, index: number): RoundSpot => ({
  x: pileSpot.x + (hash(`${key}x`) - 0.5) * 0.07,
  y: pileStep * (index + 1),
  z: pileSpot.z + (hash(`${key}z`) - 0.5) * 0.07,
  pitch: 0,
  yaw: (hash(key) - 0.5) * 1.1,
  roll: 0,
  flip: 1,
  scale: 1,
});

export const deckTop = (deckSize: number): number => deckCardThickness * Math.max(1, deckSize) + 0.004;

// Coming off the top of the deck, face down.
export const deckCardSpot = (deckSize: number): RoundSpot => ({ x: deckSpot.x, y: deckTop(deckSize), z: deckSpot.z, pitch: 0, yaw: 0, roll: 0, flip: 0, scale: 1 });

// Someone else's hand: backs fanned at the edge of the felt in front of their seat, turned to face
// the middle. `angle` in degrees, 0 at your own edge, clockwise. `lifted`: the card their pointer is
// over rises a little (spec §8). Face up once the round is over and every hand is shown.
export const seatCardSpot = (angle: number, index: number, count: number, lifted: boolean, faceUp: boolean): RoundSpot => {
  const turn = (angle * Math.PI) / 180;
  const reach = { x: 1.18, z: 0.72 };
  const spacing = Math.min(0.075, 0.5 / Math.max(1, count - 1));
  const offset = (index - (count - 1) / 2) * spacing;
  const centre = { x: -Math.sin(turn) * reach.x, z: Math.cos(turn) * reach.z };

  return {
    x: centre.x + Math.cos(turn) * offset,
    y: 0.012 + index * 0.0012 + (lifted ? 0.05 : 0),
    z: centre.z + Math.sin(turn) * offset,
    pitch: lifted ? -0.25 : 0,
    yaw: -turn + offset * 0.9,
    roll: 0,
    flip: faceUp ? 1 : 0,
    scale: 0.58,
  };
};

const along = (frame: HandFrame, right: number, up: number, out: number): [number, number, number] =>
  [0, 1, 2].map((axis) => (frame.origin[axis] ?? 0) + (frame.right[axis] ?? 0) * right + (frame.up[axis] ?? 0) * up + (frame.out[axis] ?? 0) * out) as [number, number, number];

// How big your cards are in your hand, close to the camera: at rest, under the pointer, and picked.
// Only a little bigger under the pointer, so it doesn't hide its neighbours.
export const handScale = { none: 0.42, hovered: 0.5, selected: 0.54 } as const;

// How far apart the cards in your hand are: a big hand overlaps more rather than shrinking.
const handSpacing = (frame: HandFrame, count: number): number => Math.min(cardSize.width * handScale.none * 0.74, (frame.width * 0.5) / Math.max(1, count - 1));

// Your hand: fanned along the bottom of the screen, facing you, in a gentle arc. A big hand
// overlaps more rather than shrinking (spec §9.2). The card your pointer is over (`hovered`) rises
// and grows; a card you clicked (`selected`) rises higher, waiting for a second click.
export const handCardSpot = (frame: HandFrame, index: number, count: number, raise: 'none' | 'hovered' | 'selected'): RoundSpot => {
  const scale = handScale[raise];
  const spacing = handSpacing(frame, count);
  const offset = (index - (count - 1) / 2) * spacing;
  const edge = offset / Math.max(0.2, frame.width * 0.5);
  const lift = cardSize.depth * (scale - handScale.none) * 0.6 + (raise === 'selected' ? cardSize.depth * 0.12 : 0);
  const [x, y, z] = along(frame, offset, -edge * edge * 0.04 + lift, index * 0.002 + (raise === 'none' ? 0 : 0.03));

  return { x, y, z, pitch: frame.pitch, yaw: raise === 'none' ? -edge * 0.16 : 0, roll: 0, flip: 1, scale };
};

// Which card in your hand a spot on it belongs to, judged by how far across your hand it is against
// the cards at rest: each shows from its left edge to the next card's (the one to its right lies on
// top). A card rising and growing under the pointer never steals it from its neighbours.
export const handIndexAt = (frame: HandFrame, count: number, spot: readonly [number, number, number]): number => {
  const spacing = handSpacing(frame, count);
  const across = [0, 1, 2].reduce((sum, axis) => sum + ((spot[axis] ?? 0) - (frame.origin[axis] ?? 0)) * (frame.right[axis] ?? 0), 0);
  const firstEdge = -((count - 1) / 2) * spacing - (cardSize.width * handScale.none) / 2;

  return Math.min(count - 1, Math.max(0, Math.floor((across - firstEdge) / spacing)));
};
