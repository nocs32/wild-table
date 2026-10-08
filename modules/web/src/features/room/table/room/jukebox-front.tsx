import type { ReactElement } from 'react';
import { furniture, glow } from '../palette';

// The heights of the speaker grille's chrome bars.
const grille = [0.24, 0.3, 0.36, 0.42];

// The jukebox's front: a record behind the glowing window in a chrome frame, the speaker grille
// under it, and a bubble tube glowing up each side.
export function RoomTableRoomJukeboxFront(): ReactElement {
  return (
    <group position={[0, 0, 0.3]}>
      <mesh position={[0, 0.86, 0.002]}>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial color={furniture.chrome} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.86, 0.005]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.2, 0.2, 0.006, 32]} />
        <meshStandardMaterial color={furniture.record} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.86, 0.009]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.06, 0.06, 0.004, 24]} />
        <meshStandardMaterial color={furniture.canRed} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.86, 0.013]}>
        <planeGeometry args={[0.72, 0.52]} />
        <meshBasicMaterial color={glow.cyan} toneMapped={false} transparent opacity={0.3} />
      </mesh>
      {grille.map((y) => (
        <mesh key={y} position={[0, y, 0.008]}>
          <boxGeometry args={[0.72, 0.018, 0.012]} />
          <meshStandardMaterial color={furniture.chrome} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.5, 0.78, 0.01]}>
          <cylinderGeometry args={[0.045, 0.045, 1.18, 12]} />
          <meshBasicMaterial color={glow.tube} toneMapped={false} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}
