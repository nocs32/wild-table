import { autorun } from 'mobx';
import { useCallback, type RefCallback } from 'react';
import type { RoomGameTurnStore } from '../../../stores/room/game/turn';

// Keeps the fuse's length in a CSS variable, outside React's renders (spec §8.3).
export const useRoomRoundFuse = (turn: RoomGameTurnStore): RefCallback<HTMLElement> =>
  useCallback(
    (element: HTMLElement | null) => {
      if (!element) return undefined;

      return autorun(() => element.style.setProperty('--fuse', String(turn.fuse ?? 0)));
    },
    [turn],
  );
