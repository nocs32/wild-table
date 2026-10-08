import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import type { TableStore } from '../../../../stores/table';
import { Spring } from '../../../../utils/spring';
import { pokedAgo } from './use-prop';

// The hanging lamp, every frame: it sways a little on its own, swings when poked, and swings hard
// when a +4 slams down (spec §8.1). Its light follows it across the table.
export const useRoomTableRoomLamp = (table: TableStore): RefObject<Group | null> => {
  const ref = useRef<Group>(null);
  const swing = useRef(new Spring(0, 9, 0.35));
  const seen = useRef({ count: 0, slamAt: table.round.effects.slamAt });

  useFrame(({ clock }, dt) => {
    const { count } = pokedAgo(table, 'lamp');
    const { slamAt } = table.round.effects;

    if (count !== seen.current.count) swing.current.velocity += 0.45;

    if (slamAt !== seen.current.slamAt) swing.current.velocity += 0.8;

    seen.current = { count, slamAt };
    swing.current.step(dt);
    table.sway.lamp = swing.current.value + Math.sin(clock.elapsedTime * 0.7) * 0.012;

    if (!ref.current) return;

    ref.current.rotation.z = table.sway.lamp;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.008;
  });

  return ref;
};
