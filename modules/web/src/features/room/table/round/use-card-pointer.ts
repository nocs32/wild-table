import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';

export interface RoomTableRoundCardPointer {
  over: (event: ThreeEvent<PointerEvent>) => void;
  out: () => void;
  down: (event: ThreeEvent<PointerEvent>) => void;
}

// A card in the round under the pointer. Only your own hand's cards answer it: hovering lifts one,
// pressing starts a click or a drag (the page-wide pointer hook follows it from there). Which of
// your cards that is depends on where the pointer is across your hand, not on which card it hit, so
// a raised card can't keep the pointer from its neighbours. Anything else lets the pointer through
// to what's behind (the pile, the deck).
export const useRoomTableRoundCardPointer = (key: string): RoomTableRoundCardPointer => {
  const { table } = useRootStore();

  return useMemo(() => {
    const isMine = (): boolean => table.round.cards.placeOf(key)?.kind === 'hand';
    const cardAt = ({ point }: ThreeEvent<PointerEvent>): { key: string; index: number } | null => table.round.handCardAt([point.x, point.y, point.z]);

    return {
      over: (event) => {
        if (!isMine()) return;

        event.stopPropagation();

        const card = cardAt(event);

        if (card && card.key !== table.round.hand.hoveredId) table.hover({ kind: 'hand', id: card.key, index: card.index });
      },
      out: () => table.leaveHand(),
      down: (event) => {
        if (!isMine()) return;

        event.stopPropagation();
        table.round.hand.press(cardAt(event)?.key ?? key, event.nativeEvent.clientX, event.nativeEvent.clientY);
      },
    };
  }, [key, table]);
};
