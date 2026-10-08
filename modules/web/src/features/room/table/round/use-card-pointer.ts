import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';

export interface RoomTableRoundCardPointer {
  over: (event: ThreeEvent<PointerEvent>) => void;
  out: () => void;
  down: (event: ThreeEvent<PointerEvent>) => void;
}

// A card in the round under the pointer. Only your own hand's cards answer it: hovering lifts one,
// pressing starts a click or a drag (the page-wide pointer hook follows it from there). Anything
// else lets the pointer through to what's behind (the pile, the deck).
export const useRoomTableRoundCardPointer = (key: string): RoomTableRoundCardPointer => {
  const { table } = useRootStore();

  return useMemo(() => {
    const isMine = (): boolean => table.round.cards.placeOf(key)?.kind === 'hand';

    return {
      over: (event) => {
        if (!isMine()) return;

        event.stopPropagation();
        table.hover({ kind: 'hand', id: key, index: table.round.cards.hand.indexOf(key) });
      },
      out: () => table.leave({ kind: 'hand', id: key, index: 0 }),
      down: (event) => {
        if (!isMine()) return;

        event.stopPropagation();
        table.round.hand.press(key, event.nativeEvent.clientX, event.nativeEvent.clientY);
      },
    };
  }, [key, table]);
};
