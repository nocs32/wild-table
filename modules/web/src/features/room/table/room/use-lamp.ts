import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import type { TableStore } from '../../../../stores/table';
import { Spring } from '../../../../utils/spring';
import { pokedAgo } from './use-prop';

// The hanging lamp, every frame: it sways a little on its own, and swings when poked.
export const useRoomTableRoomLamp = (table: TableStore): RefObject<Group | null> => {
  const ref = useRef<Group>(null);
  const swing = useRef(new Spring(0, 9, 0.35));
  const seen = useRef(0);

  useFrame(({ clock }, dt) => {
    const { count } = pokedAgo(table, 'lamp');

    if (count !== seen.current) {
      seen.current = count;
      swing.current.velocity += 0.45;
    }

    swing.current.step(dt);

    if (!ref.current) return;

    ref.current.rotation.z = swing.current.value + Math.sin(clock.elapsedTime * 0.7) * 0.012;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.008;
  });

  return ref;
};
