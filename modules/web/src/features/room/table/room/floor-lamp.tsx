import type { ReactElement } from 'react';
import { DoubleSide } from 'three';
import { furniture, glow } from '../palette';

// A standing lamp with a fringed shade between the table and the pinball machine, throwing a warm
// pool of light into the corner (spec §8.1).
export function RoomTableRoomFloorLamp(): ReactElement {
  return (
    <group position={[1.85, -0.82, -2.05]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 24]} />
        <meshStandardMaterial color={furniture.brass} metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.7, 8]} />
        <meshStandardMaterial color={furniture.brass} metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.14, 0.24, 0.24, 20, 1, true]} />
        <meshStandardMaterial color={furniture.velour} emissive={glow.amber} emissiveIntensity={0.35} side={DoubleSide} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshBasicMaterial color={glow.bulb} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.5, 0]} color={glow.amber} intensity={2.2} distance={3.2} decay={2} />
    </group>
  );
}
