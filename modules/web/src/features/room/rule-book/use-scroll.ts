import { useCallback, useEffect, useRef, type RefCallback } from 'react';
import type { RuleBookJump, RuleBookPage } from '../../../stores/rule-book';

// While a jump scrolls past other sections, they don't count as being read.
const jumpSettleMs = 700;

// The section being read: the last one whose heading has passed a line a quarter of the way down.
const sectionAt = (container: HTMLElement): RuleBookPage | null => {
  const line = container.getBoundingClientRect().top + container.clientHeight * 0.25;
  const sections = [...container.querySelectorAll('[data-section]')];
  const passed = sections.filter((section) => section.getBoundingClientRect().top <= line);

  return ((passed.at(-1) ?? sections[0])?.getAttribute('data-section') as RuleBookPage | undefined) ?? null;
};

// The leaflet's scrolling: a jump (a tab, or the book opening at a place) brings its section or
// house rule into view, and as you scroll, the section being read is the one the tabs show.
export const useRoomRuleBookScroll = (jump: RuleBookJump | null, see: (page: RuleBookPage) => void): RefCallback<HTMLDivElement> => {
  const container = useRef<HTMLDivElement | null>(null);
  const jumpedAt = useRef(0);

  useEffect(() => {
    const target = jump && container.current?.querySelector(jump.rule ? `[data-rule=${jump.rule}]` : `[data-section=${jump.page}]`);

    if (!jump || !target) return;

    jumpedAt.current = performance.now();
    target.scrollIntoView({ block: 'start', behavior: jump.smooth ? 'smooth' : 'instant' });
  }, [jump]);

  return useCallback(
    (element: HTMLDivElement | null) => {
      container.current = element;

      if (!element) return undefined;

      let frame = 0;

      const onScroll = (): void => {
        cancelAnimationFrame(frame);

        frame = requestAnimationFrame(() => {
          const page = sectionAt(element);

          if (page && performance.now() - jumpedAt.current > jumpSettleMs) see(page);
        });
      };

      element.addEventListener('scroll', onScroll, { passive: true });

      return () => {
        cancelAnimationFrame(frame);
        element.removeEventListener('scroll', onScroll);
      };
    },
    [see],
  );
};
