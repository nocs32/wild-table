import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import { useRootStore } from '../../../stores/use-root-store';

export interface RoomTableCardPointer {
  over: (event: ThreeEvent<PointerEvent>) => void;
  out: () => void;
  down: (event: ThreeEvent<PointerEvent>) => void;
}

// A card under the pointer: only the nearest card counts, and pressing it starts a click or a drag
// (the page-wide pointer hook follows it from there).
export const useRoomTableCardPointer = (id: number): RoomTableCardPointer => {
  const { table } = useRootStore();

  return useMemo(
    () => ({
      over: (event) => {
        event.stopPropagation();
        table.hover({ kind: 'card', id });
      },
      out: () => table.leave({ kind: 'card', id }),
      down: (event) => {
        event.stopPropagation();
        table.deck.press(id, event.nativeEvent.clientX, event.nativeEvent.clientY);
      },
    }),
    [id, table],
  );
};
