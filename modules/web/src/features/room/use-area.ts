import { useCallback, type RefCallback } from 'react';
import type { UiWidgetsAreaStore } from '../../stores/ui/widgets/area';

// Measures the stage so the floating chat stays inside it as the window or layout changes. It's a
// callback ref, so it measures whenever the stage appears: while a live table opens, the page shows
// a status card instead, and the stage (and the chat with it) only comes after.
export const useRoomArea = (area: UiWidgetsAreaStore): RefCallback<HTMLElement> =>
  useCallback(
    (element: HTMLElement | null) => {
      if (!element) return undefined;

      const measure = (): void => area.measure(element.clientWidth, element.clientHeight);
      const observer = new ResizeObserver(measure);

      measure();
      observer.observe(element);

      return () => observer.disconnect();
    },
    [area],
  );
