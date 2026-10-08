import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture, glow } from '../palette';
import { useRoomTablePoke } from '../use-poke';
import { RoomTableRoomLavaStand } from './lava-stand';
import { useRoomTableRoomLava } from './use-lava';
import { useRoomTableRoomProp } from './use-prop';

// A lava lamp glowing on a little side table (spec §8.1): its blobs rise and sink, and a poke
// stirs them up.
export const RoomTableRoomLava = observer(function RoomTableRoomLava(): ReactElement {
  const { table } = useRootStore();
  const pointer = useRoomTableRoomProp('lava');
  const wiggle = useRoomTablePoke(table.isHovered('lava'), false, 10);
  const blobs = useRoomTableRoomLava(table);

  return (
    <group position={[-2.05, -0.82, 0.45]}>
      <RoomTableRoomLavaStand />
      <group position={[0, 0.63, 0]}>
        <group ref={wiggle} onPointerOver={pointer.over} onPointerOut={pointer.out} onClick={pointer.click}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 0.12, 20]} />
            <meshStandardMaterial color={furniture.brass} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.04, 0.072, 0.36, 20]} />
            <meshStandardMaterial color={glow.lava} emissive={glow.lava} emissiveIntensity={0.35} transparent opacity={0.55} depthWrite={false} />
          </mesh>
          <group ref={blobs}>
            {[0.032, 0.026, 0.022].map((radius) => (
              <mesh key={radius}>
                <sphereGeometry args={[radius, 16, 12]} />
                <meshBasicMaterial color={glow.blob} toneMapped={false} />
              </mesh>
            ))}
          </group>
          <mesh position={[0, 0.51, 0]}>
            <cylinderGeometry args={[0.025, 0.04, 0.07, 16]} />
            <meshStandardMaterial color={furniture.brass} metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
        <pointLight position={[0, 0.3, 0.1]} color={glow.lava} intensity={0.9} distance={1.6} decay={2} />
      </group>
    </group>
  );
});
