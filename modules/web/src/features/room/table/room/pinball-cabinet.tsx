import type { ReactElement, RefObject } from 'react';
import type { MeshBasicMaterial } from 'three';
import { furniture, glow } from '../palette';
import { RoomTableRoomPinballSide } from './pinball-side';

interface RoomTableRoomPinballCabinetProps {
  // The playfield's lights: they flash at the podium.
  playfield: RefObject<MeshBasicMaterial | null>;
}

// The pinball machine's cabinet, tipped towards the player: the playfield glowing under glass between
// chrome rails, a pink stripe down each side, the coin door with its lit slots, a flipper button on
// either side and the plunger.
export function RoomTableRoomPinballCabinet({ playfield }: RoomTableRoomPinballCabinetProps): ReactElement {
  return (
    <group position={[0, 0.98, 0]} rotation-x={0.08}>
      <mesh>
        <boxGeometry args={[0.8, 0.32, 1.4]} />
        <meshStandardMaterial color={furniture.wood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.162, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.7, 1.3]} />
        <meshBasicMaterial ref={playfield} color={glow.pink} toneMapped={false} transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, 0.172, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.72, 1.32]} />
        <meshStandardMaterial color={furniture.cardEdge} transparent opacity={0.12} roughness={0.05} metalness={0.4} />
      </mesh>
      <RoomTableRoomPinballSide side={-1} />
      <RoomTableRoomPinballSide side={1} />
      <mesh position={[0, -0.02, 0.703]}>
        <boxGeometry args={[0.3, 0.2, 0.008]} />
        <meshStandardMaterial color={furniture.ink} roughness={0.6} />
      </mesh>
      {[-0.05, 0.05].map((x) => (
        <mesh key={x} position={[x, 0.02, 0.709]}>
          <planeGeometry args={[0.025, 0.05]} />
          <meshBasicMaterial color={glow.slot} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0.3, 0.06, 0.74]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
        <meshStandardMaterial color={furniture.chrome} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}
