import type { ReactElement } from 'react';
import { furniture, glow } from '../palette';

// The pinball machine at the back right: a cabinet with its playfield glowing pink and its
// backglass lit cyan. Its score display gets the winner's name at the podium (spec §8.1).
export function RoomTableRoomPinball(): ReactElement {
  return (
    <group position={[2.2, -0.82, -3.4]} rotation-y={-0.35}>
      <mesh position={[0, 0.95, 0]} rotation-x={-0.12}>
        <boxGeometry args={[0.8, 0.35, 1.4]} />
        <meshStandardMaterial color={furniture.wood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.55, -0.62]}>
        <boxGeometry args={[0.8, 0.85, 0.16]} />
        <meshStandardMaterial color={furniture.wood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.55, -0.535]}>
        <planeGeometry args={[0.66, 0.66]} />
        <meshBasicMaterial color={glow.cyan} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 1.13, 0]} rotation-x={-Math.PI / 2 - 0.12}>
        <planeGeometry args={[0.66, 1.2]} />
        <meshBasicMaterial color={glow.pink} toneMapped={false} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
