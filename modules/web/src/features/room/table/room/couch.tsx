import { RoundedBox } from '@react-three/drei';
import type { ReactElement } from 'react';
import { furniture } from '../palette';
import { RoomTableRoomCouchArm } from './couch-arm';

// Where the loveseat's two cushions sit, across it.
const cushions = [-0.52, 0.52];

// A low velour loveseat against the panelling, under the neon sign (spec §8.1): plump seat and back
// cushions, rolled arms, short wooden legs, and a teal throw pillow tossed in the corner.
export function RoomTableRoomCouch(): ReactElement {
  return (
    <group position={[0, -0.82, -3.95]}>
      <RoundedBox args={[2.3, 0.2, 0.82]} radius={0.05} smoothness={3} position={[0, 0.2, 0]}>
        <meshStandardMaterial color={furniture.velourDeep} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[2.3, 0.6, 0.16]} radius={0.06} smoothness={3} position={[0, 0.52, -0.34]}>
        <meshStandardMaterial color={furniture.velourDeep} roughness={0.95} />
      </RoundedBox>
      {cushions.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <RoundedBox args={[1.02, 0.16, 0.66]} radius={0.06} smoothness={3} position={[0, 0.37, 0.05]}>
            <meshStandardMaterial color={furniture.velour} roughness={0.95} />
          </RoundedBox>
          <RoundedBox args={[1.0, 0.46, 0.18]} radius={0.08} smoothness={3} position={[0, 0.66, -0.22]} rotation-x={-0.14}>
            <meshStandardMaterial color={furniture.velour} roughness={0.95} />
          </RoundedBox>
        </group>
      ))}
      <RoomTableRoomCouchArm side={-1} />
      <RoomTableRoomCouchArm side={1} />
      <RoundedBox args={[0.36, 0.34, 0.12]} radius={0.06} smoothness={3} position={[-0.95, 0.6, -0.12]} rotation={[-0.25, 0.35, -0.3]}>
        <meshStandardMaterial color={furniture.pillow} roughness={0.9} />
      </RoundedBox>
    </group>
  );
}
