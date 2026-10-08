import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef, type RefObject } from 'react';
import { Vector3, type PerspectiveCamera } from 'three';
import { figurePlace } from '../../../stores/table/round/figures';

interface Spot {
  x: number;
  y: number;
  z: number;
}

interface Size {
  width: number;
  height: number;
}

// Where the camera stands, and how far the view is shifted (in pixels, right and down).
interface Shot {
  distance: number;
  shift: { x: number; y: number };
}

// How far the table reaches, rail and all, from its middle: the camera keeps all of it in view.
const reach = { width: 2.15, depth: 1.5 };
// Looking down at the table at an angle, as if from your chair, with the room behind it (spec §8).
const pitch = 0.6;
const lookAt = { y: 0.05, z: -0.1 };
const distanceRange = { min: 3.8, max: 13 };
// In a round, what has to be in view between the turn's prompt and your hand: the top of the hat of
// the player across the table (their figure stands behind the far rail), down to the middle of your
// fuse, which may sink under your hand but stays above this share of the view; and the rail's ends.
const farHat: Spot = { x: 0, y: figurePlace.floor + figurePlace.height - 0.05, z: -figurePlace.reach.z };
const nearFuse: Spot = { x: 0, y: 0.13, z: 1.18 };
const railEnd: Spot = { x: reach.width, y: 0.13, z: 0 };
const fuseShare = 0.06;
// Pixels kept clear round what has to be in view.
const pad = 6;

// What's covering the table: the lobby's cards on the left and right, and in a round the turn's
// prompt at the top (in pixels).
export interface RoomTableCameraInsets {
  left: number;
  right: number;
  top: number;
  // In a round: your hand along the bottom, and the other players' figures round the table.
  round: boolean;
  // How far the camera backs off from the closest view that fits: more in the lobby, and at the
  // podium, so the pinball machine is in view.
  margin: number;
}

const clampDistance = (distance: number): number => Math.min(distanceRange.max, Math.max(distanceRange.min, distance));

// Where a spot is seen from the camera `distance` away: the tangents of the angles to the right of
// and above the middle of the view.
const sighting = (spot: Spot, distance: number): { x: number; y: number } => {
  const dy = spot.y - lookAt.y - Math.sin(pitch) * distance;
  const dz = spot.z - lookAt.z - Math.cos(pitch) * distance;
  const depth = -dy * Math.sin(pitch) - dz * Math.cos(pitch);

  return { x: spot.x / depth, y: (dy * Math.cos(pitch) - dz * Math.sin(pitch)) / depth };
};

// Whether, from `distance` away, the far hat down to your fuse and the rail end to end fit in the
// free part of the view. `focal` is the lens's pixels per tangent.
const fitsAt = (distance: number, focal: number, free: Size): boolean => {
  const tall = (sighting(farHat, distance).y - sighting(nearFuse, distance).y) * focal;
  const wide = sighting(railEnd, distance).x * 2 * focal;

  return tall <= free.height && wide <= free.width;
};

// A round's view: the closest the camera can come with everything that matters in the band between
// the prompt and your hand (found by halving), shifted so it's in the middle of that band.
const roundShot = (focal: number, size: Size, { left, right, top, margin }: RoomTableCameraInsets): Shot => {
  const bottom = size.height * fuseShare;
  const free = { width: Math.max(160, size.width - left - right - pad * 2), height: Math.max(80, size.height - top - bottom - pad * 2) };
  const range = { near: 1, far: distanceRange.max };

  for (let step = 0; step < 24; step += 1) {
    const middle = (range.near + range.far) / 2;

    if (fitsAt(middle, focal, free)) range.far = middle;
    else range.near = middle;
  }

  const distance = clampDistance(range.far + margin);
  const centre = ((sighting(farHat, distance).y + sighting(nearFuse, distance).y) / 2) * focal;

  return { distance, shift: { x: (left - right) / 2, y: (top - bottom) / 2 + centre } };
};

// The lobby's view: the whole table with room round it, backing off on narrow screens and coming
// closer on wide ones.
const lobbyShot = (half: number, size: Size, { left, right, margin }: RoomTableCameraInsets): Shot => {
  const free = Math.max(160, size.width - left - right);
  const forWidth = reach.width / (half * (free / size.height)) + margin;
  const forDepth = (reach.depth / half) * (0.6 + margin * 0.39);

  return { distance: clampDistance(Math.max(forWidth, forDepth)), shift: { x: (left - right) / 2, y: 0 } };
};

// Frames the table in the part of the screen that's left free. When the free part isn't in the
// middle, the view is shifted so what matters is in the middle of what's free. Gives back where the
// camera stands, for the shake.
export const useRoomTableCamera = (insets: RoomTableCameraInsets): RefObject<Vector3> => {
  const { camera, size } = useThree();
  const base = useRef(new Vector3());
  const { left, right, top, round, margin } = insets;

  useLayoutEffect(() => {
    const lens = camera as PerspectiveCamera;
    const half = Math.tan((lens.fov * Math.PI) / 360);
    const view = { width: size.width, height: size.height };
    const shot = round ? roundShot(size.height / 2 / half, view, { left, right, top, round, margin }) : lobbyShot(half, view, { left, right, top, round, margin });

    lens.position.set(0, lookAt.y + Math.sin(pitch) * shot.distance, lookAt.z + Math.cos(pitch) * shot.distance);
    lens.lookAt(0, lookAt.y, lookAt.z);
    base.current.copy(lens.position);
    // A shift only: the window onto the view moves, the lens's angle stays the same.
    lens.setViewOffset(size.width, size.height, -shot.shift.x, -shot.shift.y, size.width, size.height);
    lens.updateProjectionMatrix();
  }, [camera, size.width, size.height, left, right, top, round, margin]);

  return base;
};
