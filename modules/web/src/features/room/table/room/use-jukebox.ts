import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { MeshBasicMaterial } from 'three';
import type { TableRoundEffects } from '../../../../stores/table/round';
import { glow } from '../palette';

// How long the lights flash after a round is won, in seconds.
const flashSeconds = 3;

export interface RoomTableRoomJukeboxLights {
  outer: RefObject<MeshBasicMaterial | null>;
  inner: RefObject<MeshBasicMaterial | null>;
}

// The jukebox's arches, every frame: steady, and flashing in turn when someone wins a round
// (spec §8.1).
export const useRoomTableRoomJukebox = (effects: TableRoundEffects): RoomTableRoomJukeboxLights => {
  const outer = useRef<MeshBasicMaterial>(null);
  const inner = useRef<MeshBasicMaterial>(null);

  useFrame(() => {
    const ago = (performance.now() - effects.winAt) / 1000;
    const flashing = effects.winAt >= 0 && ago < flashSeconds;
    const beat = flashing ? Math.floor(ago * 7) % 2 : -1;

    outer.current?.color.copy(glow.pink).multiplyScalar(beat === 0 ? 1.9 : beat === 1 ? 0.35 : 1);
    inner.current?.color.copy(glow.amber).multiplyScalar(beat === 1 ? 2.1 : beat === 0 ? 0.35 : 1);
  });

  return { outer, inner };
};
