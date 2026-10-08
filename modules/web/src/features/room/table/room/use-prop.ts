import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import type { TableProp, TableStore } from '../../../../stores/table';
import { useRootStore } from '../../../../stores/use-root-store';

export interface RoomTableRoomPropPointer {
  over: (event: ThreeEvent<PointerEvent>) => void;
  out: () => void;
  click: (event: ThreeEvent<MouseEvent>) => void;
}

// A prop to poke (spec §8.1): pointing at it says what a click does, and a click pokes it.
export const useRoomTableRoomProp = (prop: TableProp): RoomTableRoomPropPointer => {
  const { table } = useRootStore();

  return useMemo(
    () => ({
      over: (event) => {
        event.stopPropagation();
        table.hover({ kind: 'prop', prop });
      },
      out: () => table.leave({ kind: 'prop', prop }),
      click: (event) => {
        event.stopPropagation();
        table.poke(prop);
      },
    }),
    [prop, table],
  );
};

// Seconds since a prop was last poked (a long time if never), and how many times it has been.
export const pokedAgo = (table: TableStore, prop: TableProp): { seconds: number; count: number } => {
  const poke = table.pokes.get(prop);

  return { seconds: poke ? (Date.now() - poke.at) / 1000 : 1e9, count: poke?.count ?? 0 };
};
