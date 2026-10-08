import type { ReactElement } from 'react';
import type { CanvasTexture } from 'three';
import { furniture, glow } from '../palette';

interface RoomTableRoomPinballBackboxProps {
  // The dot-matrix display's picture: who won.
  display: CanvasTexture;
}

// The pinball machine's backbox, standing up at the back of the cabinet: the backglass lit cyan in a
// chrome frame, the score display under it, and a pink strip lit along the top.
export function RoomTableRoomPinballBackbox({ display }: RoomTableRoomPinballBackboxProps): ReactElement {
  return (
    <group position={[0, 1.58, -0.62]}>
      <mesh>
        <boxGeometry args={[0.8, 0.88, 0.18]} />
        <meshStandardMaterial color={furniture.wood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 0.091]}>
        <planeGeometry args={[0.72, 0.54]} />
        <meshStandardMaterial color={furniture.chrome} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.1, 0.093]}>
        <planeGeometry args={[0.66, 0.48]} />
        <meshBasicMaterial color={glow.cyan} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, -0.27, 0.093]}>
        <planeGeometry args={[0.66, 0.165]} />
        <meshBasicMaterial map={display} color={glow.display} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.43, 0.06]}>
        <boxGeometry args={[0.82, 0.03, 0.06]} />
        <meshBasicMaterial color={glow.pink} toneMapped={false} />
      </mesh>
    </group>
  );
}
