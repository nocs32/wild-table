import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import { Spring } from '../../../utils/spring';

interface Poke {
  ref: RefObject<Group | null>;
  // Pops in when it first appears (a tent card being switched on).
  grow: boolean;
}

// Something on the table you can click (spec §8): it lifts and wiggles while pointed at, and every
// so often gives a small wiggle on its own, so people notice it.
export const useRoomTablePoke = (hovered: boolean, grow = false, every = 9): Poke['ref'] => {
  const ref = useRef<Group>(null);
  const lift = useRef(new Spring(0, 260, 16));
  const wiggle = useRef(new Spring(0, 240, 5));
  const scale = useRef(new Spring(grow ? 0.01 : 1, 220, 14));
  const was = useRef({ hovered: false, nudged: 0 });

  useFrame(({ clock }, dt) => {
    const time = clock.elapsedTime;

    if (hovered && !was.current.hovered) wiggle.current.velocity += 3;

    if (!hovered && time - was.current.nudged > every) {
      was.current.nudged = time;
      wiggle.current.velocity += 1.6;
    }

    was.current.hovered = hovered;
    lift.current.target = hovered ? 0.05 : 0;
    scale.current.target = 1;
    [lift, wiggle, scale].forEach((spring) => spring.current.step(dt));

    if (!ref.current) return;

    ref.current.position.y = lift.current.value;
    ref.current.rotation.z = wiggle.current.value * 0.08;
    ref.current.scale.setScalar(Math.max(0.01, scale.current.value));
  });

  return ref;
};
