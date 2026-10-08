import { useFrame } from '@react-three/fiber';
import { cardColours } from '@wild-table/protocol';
import { createRef, useMemo, useRef, type RefObject } from 'react';
import type { Mesh } from 'three';
import type { TableStore } from '../../../../stores/table';

// How far apart the orbs float, how high, and how long they take to rise.
const gap = 0.24;
const height = 0.26;
const riseSeconds = 0.45;

// Overshoots a little, then settles: the orbs pop up.
const springOut = (t: number): number => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

// The four colour orbs, every frame (spec §5.4): they rise over the pile, bob, and the one under the
// pointer swells.
export const useRoomTableRoundOrbs = (table: TableStore): RefObject<Mesh | null>[] => {
  const refs = useMemo(() => cardColours.map(() => createRef<Mesh>()), []);
  const shownAt = useRef<number | null>(null);

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    const hovered = table.hovered?.kind === 'orb' ? table.hovered.colour : null;

    shownAt.current ??= now;

    const rise = springOut(Math.min(1, (now - shownAt.current) / riseSeconds));

    refs.forEach((ref, index) => {
      const orb = ref.current;
      const colour = cardColours[index];

      if (!orb) return;

      orb.position.set((index - 1.5) * gap, 0.06 + rise * height + Math.sin(now * 2.4 + index * 1.3) * 0.014, 0);
      orb.scale.setScalar(orb.scale.x + ((colour === hovered ? 1.3 : 1) - orb.scale.x) * 0.2);
    });
  });

  return refs;
};
