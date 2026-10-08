import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import type { TableStore } from '../../../../stores/table';
import { pokedAgo } from './use-prop';

// The boombox's speakers: they pump to a beat for a few seconds after a poke.
export const useRoomTableRoomBoombox = (table: TableStore): RefObject<Group | null> => {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    const { seconds } = pokedAgo(table, 'boombox');
    const beat = seconds < 4 ? Math.max(0, Math.sin(clock.elapsedTime * 13)) * (1 - seconds / 4) : 0;

    ref.current?.children.forEach((speaker) => speaker.scale.setScalar(1 + beat * 0.22));
  });

  return ref;
};
