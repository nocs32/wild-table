import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DoubleSide } from 'three';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture, glow } from '../palette';
import { useStainedGlassTexture } from '../use-textures';
import { useRoomTableRoomLamp } from './use-lamp';
import { useRoomTableRoomProp } from './use-prop';
import { useRoomTablePoke } from '../use-poke';

// The hanging stained-glass lamp over the table (spec §8.1): panes in the four card colours, a
// bright bulb under it, on a long chain from the ceiling. Poke it and it swings.
export const RoomTableRoomLamp = observer(function RoomTableRoomLamp(): ReactElement {
  const { table } = useRootStore();
  const texture = useStainedGlassTexture();
  const swing = useRoomTableRoomLamp(table);
  const pointer = useRoomTableRoomProp('lamp');
  const wiggle = useRoomTablePoke(table.isHovered('lamp'), false, 14);

  return (
    <group position={[0, 3.36, 0.05]} ref={swing}>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.7, 6]} />
        <meshStandardMaterial color={furniture.ink} metalness={0.6} roughness={0.5} />
      </mesh>
      <group position={[0, -1.82, 0]}>
        <group ref={wiggle}>
          <mesh onPointerOver={pointer.over} onPointerOut={pointer.out} onClick={pointer.click}>
            <cylinderGeometry args={[0.13, 0.42, 0.24, 12, 1, true]} />
            <meshStandardMaterial map={texture} emissiveMap={texture} emissive={furniture.cardEdge} emissiveIntensity={0.7} side={DoubleSide} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.06, 0.14, 0.05, 12]} />
            <meshStandardMaterial color={furniture.brass} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.12, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.42, 0.012, 6, 36]} />
            <meshStandardMaterial color={furniture.brass} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.07, 16, 12]} />
            <meshBasicMaterial color={glow.bulb} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
});
