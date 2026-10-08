import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture, glow } from '../palette';
import { useRoomTableRoomPinball } from './use-pinball';

// The pinball machine at the back right: a cabinet with its playfield glowing pink, its backglass
// lit cyan, and a dot-matrix score display that scrolls who won, flashing at the podium (spec §8.1).
export const RoomTableRoomPinball = observer(function RoomTableRoomPinball(): ReactElement {
  const { table } = useRootStore();
  const { display, playfield } = useRoomTableRoomPinball(table.pinballLine, table.isJackpot);

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
      <mesh position={[0, 1.66, -0.535]}>
        <planeGeometry args={[0.66, 0.46]} />
        <meshBasicMaterial color={glow.cyan} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 1.31, -0.535]}>
        <planeGeometry args={[0.66, 0.165]} />
        <meshBasicMaterial map={display} color={glow.display} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.13, 0]} rotation-x={-Math.PI / 2 - 0.12}>
        <planeGeometry args={[0.66, 1.2]} />
        <meshBasicMaterial ref={playfield} color={glow.pink} toneMapped={false} transparent opacity={0.25} />
      </mesh>
    </group>
  );
});
