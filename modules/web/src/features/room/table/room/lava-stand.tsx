import type { ReactElement } from 'react';
import { furniture } from '../palette';

// The little round side table the lava lamp stands on.
export function RoomTableRoomLavaStand(): ReactElement {
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.6, 12]} />
        <meshStandardMaterial color={furniture.wood} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.61, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.035, 32]} />
        <meshStandardMaterial color={furniture.wood} roughness={0.5} />
      </mesh>
    </group>
  );
}
