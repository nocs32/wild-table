import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef, type RefObject } from 'react';
import { Vector3, type PerspectiveCamera } from 'three';

// How far the table reaches, rail and all, from its middle: the camera keeps all of it in view.
const reach = { width: 2.15, depth: 1.5 };
// Looking down at the table at an angle, as if from your chair, with the room behind it (spec §8).
const pitch = 0.6;
const lookAt = { y: 0.05, z: -0.1 };

// What's covering the table: the lobby's cards on the left and right (in pixels), and in a round
// your hand along the bottom (a share of the view's height).
export interface RoomTableCameraInsets {
  left: number;
  right: number;
  bottomShare: number;
  // How much room to leave round the table: less in a round, when the table is what matters.
  margin: number;
}

// Frames the table in the part of the screen that's left free, backing off on narrow screens and
// coming closer on wide ones. When the free part isn't in the middle, the view is shifted so the
// table's centre is in the middle of what's free. Gives back where the camera stands, for the shake.
export const useRoomTableCamera = ({ left, right, bottomShare, margin }: RoomTableCameraInsets): RefObject<Vector3> => {
  const { camera, size } = useThree();
  const base = useRef(new Vector3());

  useLayoutEffect(() => {
    const lens = camera as PerspectiveCamera;
    const bottom = Math.round(size.height * bottomShare);
    const free = { width: Math.max(160, size.width - left - right), height: Math.max(120, size.height - bottom) };
    // The lens's height covers the shifted view's whole frame: what's free is a part of it.
    const frameHeight = size.height + bottom;
    const half = Math.tan((lens.fov * Math.PI) / 360);
    const forWidth = reach.width / (half * (free.width / frameHeight)) + margin;
    const forDepth = ((reach.depth * frameHeight) / (half * free.height)) * (0.6 + margin * 0.39);
    const distance = Math.min(13, Math.max(3.8, forWidth, forDepth));
    const shift = { x: (left - right) / 2, y: bottom / 2 };

    lens.position.set(0, lookAt.y + Math.sin(pitch) * distance, lookAt.z + Math.cos(pitch) * distance);
    lens.lookAt(0, lookAt.y, lookAt.z);
    base.current.copy(lens.position);

    if (shift.x === 0 && shift.y === 0) lens.clearViewOffset();
    else lens.setViewOffset(size.width + Math.abs(shift.x) * 2, frameHeight, Math.abs(shift.x) - shift.x, bottom, size.width, size.height);

    lens.updateProjectionMatrix();
  }, [camera, size.width, size.height, left, right, bottomShare, margin]);

  return base;
};
