import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture, glow } from '../palette';
import { useRoomTablePoke } from '../use-poke';
import { useRoomTableRoomBoombox } from './use-boombox';
import { useRoomTableRoomProp } from './use-prop';

// A boombox on the floor by the table: poke it and its speakers pump (spec §8.1).
export const RoomTableRoomBoombox = observer(function RoomTableRoomBoombox(): ReactElement {
  const { table } = useRootStore();
  const pointer = useRoomTableRoomProp('boombox');
  const wiggle = useRoomTablePoke(table.isHovered('boombox'), false, 12);
  const speakers = useRoomTableRoomBoombox(table);

  return (
    <group position={[-1.55, -0.82, 1.6]} rotation-y={0.45}>
      <group ref={wiggle}>
        <mesh position={[0, 0.17, 0]} castShadow onPointerOver={pointer.over} onPointerOut={pointer.out} onClick={pointer.click}>
          <boxGeometry args={[0.66, 0.32, 0.2]} />
          <meshStandardMaterial color={furniture.ink} roughness={0.45} metalness={0.2} />
        </mesh>
        <group ref={speakers}>
          {[-0.21, 0.21].map((x) => (
            <mesh key={x} position={[x, 0.16, 0.103]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.1, 0.1, 0.012, 24]} />
              <meshStandardMaterial color={furniture.brass} metalness={0.7} roughness={0.35} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 0.2, 0.104]}>
          <planeGeometry args={[0.14, 0.06]} />
          <meshBasicMaterial color={glow.cyan} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.36, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.2, 0.014, 6, 24, Math.PI]} />
          <meshStandardMaterial color={furniture.brass} metalness={0.7} roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
});
