import type { ReactElement } from 'react';
import { useRugTexture } from '../use-textures';

// A 70s shag rug under the card table (spec §8.1).
export function RoomTableRoomRug(): ReactElement {
  const texture = useRugTexture();

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.815, 0.1]} scale={[2.9, 2.2, 1]} receiveShadow>
      <circleGeometry args={[1, 64]} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  );
}
