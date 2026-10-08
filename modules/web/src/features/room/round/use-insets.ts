import { useCallback, type RefCallback } from 'react';
import type { TableStore } from '../../../stores/table';

// On a phone the dock's rail stands down the left of the view during a round too: measures it, so
// the camera and your hand centre on what's left of the table. Nothing covers it otherwise.
export const useRoomRoundInsets = (table: TableStore, isCompact: boolean): RefCallback<HTMLElement> =>
  useCallback(
    (root: HTMLElement | null) => {
      if (!root) return undefined;

      const measure = (): void => {
        const box = root.getBoundingClientRect();
        const rail = isCompact ? root.parentElement?.querySelector('[data-rail]')?.getBoundingClientRect() : undefined;

        table.setInsets(rail ? Math.max(0, rail.right - box.left) : 0, 0);
      };

      const observer = new ResizeObserver(measure);

      measure();
      observer.observe(root);

      return () => {
        observer.disconnect();
        table.setInsets(0, 0);
      };
    },
    [table, isCompact],
  );
