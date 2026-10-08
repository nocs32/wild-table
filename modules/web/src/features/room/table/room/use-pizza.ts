import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import type { TableStore } from '../../../../stores/table';
import { Spring } from '../../../../utils/spring';
import { pokedAgo } from './use-prop';

// The pizza box's lid: each poke opens it or shuts it, with a little bounce.
export const useRoomTableRoomPizza = (table: TableStore): RefObject<Group | null> => {
  const ref = useRef<Group>(null);
  const lid = useRef(new Spring(0, 160, 9));

  useFrame((_, dt) => {
    lid.current.target = pokedAgo(table, 'pizza').count % 2 === 1 ? -1.25 : 0;
    lid.current.step(dt);

    if (ref.current) ref.current.rotation.x = lid.current.value;
  });

  return ref;
};
