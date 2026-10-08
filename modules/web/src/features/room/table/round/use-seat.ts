import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import type { TableRoundStore } from '../../../../stores/table/round';

// Keeps a player's place card where it belongs, every frame: yours rides at the left end of your
// hand, which moves with the camera.
export const useRoomTableRoundSeat = (round: TableRoundStore, angle: number, isMe: boolean): RefObject<Group | null> => {
  const ref = useRef<Group>(null);

  useFrame(() => {
    const [x, y, z] = round.portraitSpot(angle, isMe);

    ref.current?.position.set(x, y, z);
  });

  return ref;
};
