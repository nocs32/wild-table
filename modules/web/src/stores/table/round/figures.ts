import { figureSize, type FigureMood } from '../../../art';
import { cardSize } from '../body';
import type { RoundSpot } from './body';
import type { HandFrame } from './layout';

type Point3 = [number, number, number];

// The other players' stick figures (see `useRoomTableFiguresItem`): standing just outside the rail
// at their seats, big enough to read across the table, with their chests (the drawing's y = 192)
// at the rail's height and their feet out of sight behind the table. Table units.
const height = 2.08;
const chest = { y: 192, at: 0.118 };

export const figurePlace = {
  reach: { x: 2.02, z: 1.68 },
  floor: chest.at - height * (1 - chest.y / figureSize.height),
  height,
  width: (height * figureSize.width) / figureSize.height,
} as const;

// Where a figure stands at a seat: its feet, out of sight behind the table.
export const seatSpot = (angle: number): Point3 => {
  const turn = (angle * Math.PI) / 180;

  return [-Math.sin(turn) * figurePlace.reach.x, figurePlace.floor, Math.cos(turn) * figurePlace.reach.z];
};

// In the lobby, everyone who's joined hangs about the room (spec §8.1), each at a spot of their own
// in the order they joined, doing something: on the loveseat, at the pinball machine, dancing by the
// jukebox, with a soda, with a slice of pizza. `x`/`z` on the floor; `look`: where their eyes go.
export interface LobbySpot {
  x: number;
  z: number;
  mood: FigureMood;
  look: { x: number; y: number };
}

export const lobbySpots: readonly LobbySpot[] = [
  { x: -0.72, z: -3.5, mood: 'lounge', look: { x: 0.5, y: -0.5 } },
  { x: 1.5, z: -2.8, mood: 'pinball', look: { x: 1, y: 0.5 } },
  { x: -1.15, z: -2.85, mood: 'dance', look: { x: 0, y: -0.5 } },
  { x: 0.72, z: -3.5, mood: 'lounge', look: { x: -0.5, y: -0.5 } },
  { x: -2.35, z: -1.95, mood: 'soda', look: { x: 0.5, y: 0 } },
  { x: 2.45, z: -1.85, mood: 'pizza', look: { x: -0.5, y: 0 } },
];

// In the lobby a figure stands on the floor itself: its feet are this far up its drawing.
const feetUp = ((figureSize.height - 454) / figureSize.height) * figurePlace.height;

export const lobbySpot = (index: number): Point3 => {
  const spot = lobbySpots[index % lobbySpots.length] ?? { x: 0, z: -3 };

  return [spot.x, -0.82 - feetUp, spot.z];
};

// Which way a figure holds things, as you see it: towards the middle of the table, so a figure on
// the right holds them on its left (its drawing is mirrored).
export const figureSide = (angle: number): 1 | -1 => (angle > 180 ? -1 : 1);

// A point of a figure's drawing (canvas pixels): how far across it is from the middle (to the right
// as you see it, unless mirrored) and how far up from the feet.
const onFigure = (x: number, y: number): { across: number; up: number } => ({
  across: ((x - figureSize.width / 2) / figureSize.width) * figurePlace.width,
  up: (1 - y / figureSize.height) * figurePlace.height,
});

// On their turn, someone else picks their cards up off the felt and holds them up in a fan in front
// of their chest, up to their chin, backs to you (spec §8): plain to see whose turn it is. `grip`:
// the fan's pivot, where the figure's hands meet in its drawing; `ahead`: how far in front of the
// figure; `step`/`spread`: the turn from card to card, and the most the whole fan turns; `lean`: it
// tips towards the middle of the table; `base`: the cards' bottoms round a little arc; `layer`:
// each card just in front of the last.
const held = { grip: onFigure(150, 210), ahead: 0.2, scale: 0.6, step: 0.26, spread: 1.6, lean: 0.12, base: 0.035, layer: 0.006 };

const gripOf = (angle: number): Point3 => {
  const turn = (angle * Math.PI) / 180;

  return [-Math.sin(turn) * figurePlace.reach.x, figurePlace.floor + held.grip.up, Math.cos(turn) * figurePlace.reach.z];
};

// `from`, moved across, up and towards the camera in the plane your hand faces.
const shift = (frame: HandFrame, from: Point3, across: number, up: number, ahead: number): Point3 =>
  [0, 1, 2].map((axis) => (from[axis] ?? 0) + (frame.right[axis] ?? 0) * across + (frame.up[axis] ?? 0) * up + (frame.out[axis] ?? 0) * ahead) as Point3;

export const heldCardSpot = (frame: HandFrame, angle: number, index: number, count: number): RoundSpot => {
  const turn = (angle * Math.PI) / 180;
  const side = figureSide(angle);
  const step = Math.min(held.step, held.spread / Math.max(1, count - 1));
  // Left to right as you see them, each card over the one before; a card leans left as it turns.
  const tilt = ((count - 1) / 2 - index) * step - side * held.lean;
  const reach = held.base + (cardSize.depth * held.scale) / 2;
  const [x, y, z] = shift(frame, gripOf(angle), side * held.grip.across - Math.sin(tilt) * reach, Math.cos(tilt) * reach, held.ahead + index * held.layer);
  // The same turn as `tilt`, but the nearest to how the card lies on the felt, so it doesn't spin
  // round on the way up.
  const yaw = tilt + Math.PI * 2 * Math.round((-turn - tilt) / (Math.PI * 2));

  return { x, y, z, pitch: frame.pitch, yaw, roll: 0, flip: 0, scale: held.scale };
};

// Where the hands holding the fan go: over the bottom of it, in front of every card.
export const heldHandsSpot = (frame: HandFrame, angle: number, count: number): Point3 =>
  shift(frame, gripOf(angle), figureSide(angle) * held.grip.across, 0, held.ahead + count * held.layer + 0.01);
