import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import type { TableStore } from '../../../../stores/table';
import { pokedAgo } from './use-prop';

// The lava lamp's blobs rise and sink, each at its own pace; a poke stirs them up for a while.
export const useRoomTableRoomLava = (table: TableStore): RefObject<Group | null> => {
  const ref = useRef<Group>(null);
  const time = useRef(0);

  useFrame((_, dt) => {
    const { seconds } = pokedAgo(table, 'lava');

    time.current += dt * (seconds < 5 ? 1 + (1 - seconds / 5) * 5 : 1);

    ref.current?.children.forEach((blob, index) => {
      const phase = time.current * (0.35 + index * 0.13) + index * 2.1;

      blob.position.y = 0.2 + (Math.sin(phase) * 0.5 + 0.5) * 0.22;
      blob.scale.set(1, 1 + Math.sin(phase * 1.7) * 0.25, 1);
    });
  });

  return ref;
};
