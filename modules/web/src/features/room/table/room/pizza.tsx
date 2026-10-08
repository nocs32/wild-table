import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture } from '../palette';
import { useRoomTablePoke } from '../use-poke';
import { useRoomTableRoomPizza } from './use-pizza';
import { useRoomTableRoomProp } from './use-prop';

// A box of cold pizza with a slice gone, and two cans of soda (spec §8.1). Poke it to lift the lid.
export const RoomTableRoomPizza = observer(function RoomTableRoomPizza(): ReactElement {
  const { table } = useRootStore();
  const pointer = useRoomTableRoomProp('pizza');
  const wiggle = useRoomTablePoke(table.isHovered('pizza'), false, 13);
  const lid = useRoomTableRoomPizza(table);

  return (
    <group position={[1.42, -0.82, 1.42]} rotation-y={-0.35}>
      <group ref={wiggle} onPointerOver={pointer.over} onPointerOut={pointer.out} onClick={pointer.click}>
        <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.06, 0.6]} />
          <meshStandardMaterial color={furniture.cardboard} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.062, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.26, 32, 0.5, Math.PI * 1.66]} />
          <meshStandardMaterial color={furniture.cheese} roughness={0.7} />
        </mesh>
        {[0.6, 1.6, 2.6, 3.5, 4.4].map((angle) => (
          <mesh key={angle} position={[Math.cos(angle) * 0.15, 0.066, -Math.sin(angle) * 0.15]}>
            <cylinderGeometry args={[0.035, 0.035, 0.008, 12]} />
            <meshStandardMaterial color={furniture.sauce} roughness={0.6} />
          </mesh>
        ))}
        <group ref={lid} position={[0, 0.06, -0.3]}>
          <mesh position={[0, 0.006, 0.3]} castShadow>
            <boxGeometry args={[0.6, 0.012, 0.6]} />
            <meshStandardMaterial color={furniture.cardboard} roughness={0.9} />
          </mesh>
        </group>
      </group>
      <mesh position={[0.48, 0.085, 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.17, 16]} />
        <meshStandardMaterial color={furniture.canRed} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.5, 0.085, -0.14]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.17, 16]} />
        <meshStandardMaterial color={furniture.canBlue} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
});
