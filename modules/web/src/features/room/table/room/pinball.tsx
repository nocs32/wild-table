import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture } from '../palette';
import { RoomTableRoomPinballBackbox } from './pinball-backbox';
import { RoomTableRoomPinballCabinet } from './pinball-cabinet';
import { useRoomTableRoomPinball } from './use-pinball';

// Its four chrome legs: where each stands (x, z) and how tall it is, the back ones longer, so the
// playfield slopes down towards the player.
const legs: Array<[number, number, number]> = [
  [-0.33, 0.6, 0.78],
  [0.33, 0.6, 0.78],
  [-0.33, -0.6, 0.88],
  [0.33, -0.6, 0.88],
];

// The pinball machine at the back right (spec §8.1): a cabinet on chrome legs, its playfield glowing
// pink under the glass, and a backbox with its backglass lit cyan over a dot-matrix score display
// that scrolls who won, flashing at the podium.
export const RoomTableRoomPinball = observer(function RoomTableRoomPinball(): ReactElement {
  const { table } = useRootStore();
  const { display, playfield } = useRoomTableRoomPinball(table.pinballLine, table.isJackpot);

  return (
    <group position={[2.2, -0.82, -3.4]} rotation-y={-0.35}>
      {legs.map(([x, z, height]) => (
        <group key={`${x}|${z}`} position={[x, 0, z]}>
          <mesh position={[0, height / 2, 0]}>
            <cylinderGeometry args={[0.032, 0.026, height, 10]} />
            <meshStandardMaterial color={furniture.chrome} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.03, 12]} />
            <meshStandardMaterial color={furniture.chrome} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <RoomTableRoomPinballCabinet playfield={playfield} />
      <RoomTableRoomPinballBackbox display={display} />
    </group>
  );
});
