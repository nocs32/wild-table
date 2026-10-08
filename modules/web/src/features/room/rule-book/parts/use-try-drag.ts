import { useMemo, useState, type DragEvent } from 'react';
import type { RuleBookTryStore } from '../../../../stores/rule-book/try';

interface RoomRuleBookTryCardDrag {
  draggable: true;
  onDragStart: (event: DragEvent) => void;
}

export interface RoomRuleBookTryDrag {
  // The pile lights up while a card is dragged over it.
  isOver: boolean;
  card: (id: string) => RoomRuleBookTryCardDrag;
  pile: { onDragOver: (event: DragEvent) => void; onDragLeave: () => void; onDrop: (event: DragEvent) => void };
}

const cardType = 'application/x-wild-table-card';

// Dragging a card from the "Try it" hand onto its pile plays it, the same as clicking it.
export const useRoomRuleBookTryDrag = (store: RuleBookTryStore): RoomRuleBookTryDrag => {
  const [isOver, setOver] = useState(false);

  const handlers = useMemo(
    () => ({
      card: (id: string): RoomRuleBookTryCardDrag => ({
        draggable: true as const,
        onDragStart: (event: DragEvent): void => {
          event.dataTransfer.setData(cardType, id);
          event.dataTransfer.effectAllowed = 'move';
        },
      }),
      pile: {
        onDragOver: (event: DragEvent): void => {
          event.preventDefault();
          setOver(true);
        },
        onDragLeave: (): void => setOver(false),
        onDrop: (event: DragEvent): void => {
          event.preventDefault();
          setOver(false);
          store.play(event.dataTransfer.getData(cardType));
        },
      },
    }),
    [store],
  );

  return { isOver, ...handlers };
};
