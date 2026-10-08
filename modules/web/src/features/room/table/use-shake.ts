import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Vector3 } from 'three';
import type { TableRoundEffects } from '../../../stores/table/round';

// How long a shake lasts, in seconds.
const shakeSeconds = 0.55;

// The camera shakes when a +4 slams down, and a hard throw nudges it (spec §8, D25): a quick
// jitter round where it stands that dies away. The whole view shakes, your hand with it.
export const useRoomTableShake = (effects: TableRoundEffects, base: RefObject<Vector3>): void => {
  const shaking = useRef(false);

  useFrame(({ camera }) => {
    const ago = (performance.now() - effects.shakeAt) / 1000;

    if (ago < 0 || ago > shakeSeconds) {
      if (shaking.current) camera.position.copy(base.current);

      shaking.current = false;

      return;
    }

    const size = (1 - ago / shakeSeconds) ** 2 * effects.shake * 0.07;
    const { x, y, z } = base.current;

    shaking.current = true;
    camera.position.set(x + Math.sin(ago * 63) * size, y + Math.sin(ago * 49 + 1.3) * size * 0.7, z + Math.sin(ago * 57 + 2.1) * size * 0.4);
  });
};
