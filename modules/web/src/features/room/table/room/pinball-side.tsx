import type { ReactElement } from 'react';
import { furniture, glow } from '../palette';

interface RoomTableRoomPinballSideProps {
  // -1 the left side, 1 the right.
  side: number;
}

// One side of the pinball machine's cabinet: a chrome rail along the glass, a pink stripe down the
// side, and a flipper button near the front.
export function RoomTableRoomPinballSide({ side }: RoomTableRoomPinballSideProps): ReactElement {
  return (
    <group position={[side * 0.385, 0, 0]}>
      <mesh position={[0, 0.175, 0]}>
        <boxGeometry args={[0.035, 0.035, 1.42]} />
        <meshStandardMaterial color={furniture.chrome} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[side * 0.017, 0.02, 0]}>
        <boxGeometry args={[0.004, 0.07, 1.3]} />
        <meshBasicMaterial color={glow.pink} toneMapped={false} />
      </mesh>
      <mesh position={[side * 0.02, 0.06, 0.52]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.026, 0.026, 0.03, 12]} />
        <meshStandardMaterial color={furniture.canRed} roughness={0.4} />
      </mesh>
    </group>
  );
}
