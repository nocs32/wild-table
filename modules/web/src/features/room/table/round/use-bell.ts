import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group, Mesh, MeshStandardMaterial } from 'three';
import type { TableRoundStore } from '../../../../stores/table/round';
import { Spring } from '../../../../utils/spring';

export interface RoomTableRoundBellRefs {
  bell: RefObject<Group | null>;
  dome: RefObject<Mesh | null>;
}

// The desk bell, every frame (spec §5.6, §8.1): while it can be hit it glows and bobs, asking to be
// smacked; when anyone hits it, it rings, wobbling on its base.
export const useRoomTableRoundBell = (round: TableRoundStore, lit: boolean): RoomTableRoundBellRefs => {
  const bell = useRef<Group>(null);
  const dome = useRef<Mesh>(null);
  const wobble = useRef(new Spring(0, 300, 6));
  const rung = useRef(-1);

  useFrame(({ clock }, dt) => {
    const { bellAt } = round.effects;

    if (bellAt > rung.current) {
      rung.current = bellAt;
      wobble.current.velocity += 4;
    }

    wobble.current.step(dt);

    if (bell.current) {
      bell.current.rotation.z = wobble.current.value * 0.18;
      bell.current.position.y = lit ? Math.abs(Math.sin(clock.elapsedTime * 5)) * 0.02 : 0;
    }

    if (dome.current) (dome.current.material as MeshStandardMaterial).emissiveIntensity = lit ? 1.4 + Math.sin(clock.elapsedTime * 8) * 0.6 : 0;
  });

  return { bell, dome };
};
