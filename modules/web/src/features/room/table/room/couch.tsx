import type { ReactElement } from 'react';
import { furniture } from '../palette';

// A low velour loveseat against the panelling, under the neon sign (spec §8.1).
export function RoomTableRoomCouch(): ReactElement {
  return (
    <group position={[0, -0.82, -3.95]}>
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[2.3, 0.2, 0.8]} />
        <meshStandardMaterial color={furniture.velourDeep} roughness={0.95} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.31, 0.04]}>
          <boxGeometry args={[1.06, 0.1, 0.7]} />
          <meshStandardMaterial color={furniture.velour} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.4, -0.3]}>
        <boxGeometry args={[2.3, 0.5, 0.2]} />
        <meshStandardMaterial color={furniture.velour} roughness={0.95} />
      </mesh>
      {[-1.17, 1.17].map((x) => (
        <mesh key={x} position={[x, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.42, 0.8]} />
          <meshStandardMaterial color={furniture.velourDeep} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}
