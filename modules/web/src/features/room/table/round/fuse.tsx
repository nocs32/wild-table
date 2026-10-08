import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture, glow } from '../palette';
import { useRoomTableRoundFuse } from './use-fuse';

// Your turn's last 8 seconds (spec D11, §8.1): a fuse burns along your edge of the table, a spark
// eating its way towards the bell. When it reaches the end, the table plays for you.
export const RoomTableRoundFuse = observer(function RoomTableRoundFuse(): ReactElement {
  const { room } = useRootStore();
  const { geometry, spark, light } = useRoomTableRoundFuse(room.game.match);

  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color={furniture.cardEdge} emissive={glow.amber} emissiveIntensity={0.18} roughness={0.9} />
      </mesh>
      <mesh ref={spark}>
        <sphereGeometry args={[0.028, 12, 8]} />
        <meshBasicMaterial color={glow.bulb} toneMapped={false} />
      </mesh>
      <pointLight ref={light} color={glow.amber} distance={0.9} decay={2} />
    </group>
  );
});
