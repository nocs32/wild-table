import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { SpotLight } from 'three';
import type { TableStore } from '../../../stores/table';

// How far below where it hangs from the lamp's bulb is: its light swings that far across the table.
const bulbDrop = 1.13;

// The lamp's light follows the lamp, every frame: when it swings, the pool of light sways across
// the table (spec §8.1).
export const useRoomTableLights = (table: TableStore): RefObject<SpotLight | null> => {
  const ref = useRef<SpotLight>(null);

  useFrame(() => {
    const light = ref.current;

    if (!light) return;

    const shift = Math.sin(table.sway.lamp) * bulbDrop;

    light.position.x = shift;
    light.target.position.x = shift * 0.7;
    light.target.updateMatrixWorld();
  });

  return ref;
};
