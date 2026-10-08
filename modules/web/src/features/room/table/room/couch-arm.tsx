import { RoundedBox } from '@react-three/drei';
import type { ReactElement } from 'react';
import { furniture } from '../palette';

interface RoomTableRoomCouchArmProps {
  // -1 the left end, 1 the right.
  side: number;
}

// One end of the loveseat: a padded arm with a rolled top, standing on a short wooden leg at each
// corner.
export function RoomTableRoomCouchArm({ side }: RoomTableRoomCouchArmProps): ReactElement {
  return (
    <group position={[side * 1.13, 0, 0]}>
      <RoundedBox args={[0.22, 0.4, 0.82]} radius={0.06} smoothness={3} position={[0, 0.38, 0]}>
        <meshStandardMaterial color={furniture.velourDeep} roughness={0.95} />
      </RoundedBox>
      <mesh position={[0, 0.58, 0.02]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 20]} />
        <meshStandardMaterial color={furniture.velour} roughness={0.95} />
      </mesh>
      {[-0.32, 0.32].map((z) => (
        <mesh key={z} position={[-side * 0.02, 0.05, z]}>
          <cylinderGeometry args={[0.035, 0.022, 0.1, 10]} />
          <meshStandardMaterial color={furniture.wood} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
