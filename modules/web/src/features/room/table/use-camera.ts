import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import type { PerspectiveCamera } from 'three';

// How far the table reaches, rail and all, from its middle: the camera keeps all of it in view.
const reach = { width: 2.15, depth: 1.5 };
// Looking down at the table at an angle, as if from your chair, with the room behind it (spec §8).
const pitch = 0.6;
const lookAt = { y: 0.05, z: -0.1 };

// Frames the table in the part of the screen the lobby's cards leave free (`left` and `right`
// pixels covered), backing off on narrow screens and coming closer on wide ones. When the free part
// isn't in the middle, the view is shifted so the table's centre is in the middle of what's free.
export const useRoomTableCamera = (left: number, right: number): void => {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    const lens = camera as PerspectiveCamera;
    const free = Math.max(160, size.width - left - right);
    const half = Math.tan((lens.fov * Math.PI) / 360);
    const forWidth = reach.width / (half * (free / Math.max(1, size.height))) + 0.9;
    const forDepth = (reach.depth / half) * 0.95;
    const distance = Math.min(11, Math.max(3.8, forWidth, forDepth));
    const shift = (left - right) / 2;

    lens.position.set(0, lookAt.y + Math.sin(pitch) * distance, lookAt.z + Math.cos(pitch) * distance);
    lens.lookAt(0, lookAt.y, lookAt.z);

    if (shift === 0) lens.clearViewOffset();
    else lens.setViewOffset(size.width + Math.abs(shift) * 2, size.height, Math.abs(shift) - shift, 0, size.width, size.height);

    lens.updateProjectionMatrix();
  }, [camera, size.width, size.height, left, right]);
};
