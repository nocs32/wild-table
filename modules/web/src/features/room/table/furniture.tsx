import type { ReactElement } from 'react';
import { furniture } from './palette';
import { felt, useRailGeometry } from './use-rail';
import { useFeltTexture } from './use-textures';

// The card table (spec §8.1): green felt with a printed line, a padded leather rail round it, and
// a wooden apron underneath.
export function RoomTableFurniture(): ReactElement {
  const feltTexture = useFeltTexture();
  const railGeometry = useRailGeometry();

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} scale={[felt.x + 0.05, felt.z + 0.05, 1]} receiveShadow>
        <circleGeometry args={[1, 128]} />
        <meshStandardMaterial map={feltTexture} roughness={0.95} metalness={0} />
      </mesh>
      <mesh geometry={railGeometry} castShadow receiveShadow>
        <meshStandardMaterial color={furniture.rail} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.16, 0]} scale={[1.93, 1, 1.37]}>
        <cylinderGeometry args={[1, 0.97, 0.3, 96, 1, true]} />
        <meshStandardMaterial color={furniture.wood} roughness={0.6} />
      </mesh>
    </group>
  );
}
