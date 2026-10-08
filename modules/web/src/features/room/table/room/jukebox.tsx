import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture, glow } from '../palette';
import { useRoomTableRoomJukebox } from './use-jukebox';

// The jukebox at the back left: a dark cabinet under a rounded top, its arches glowing pink and
// amber and its front cyan. Seen as glow and silhouette, so simple shapes do. Its lights flash when
// someone wins a round.
export const RoomTableRoomJukebox = observer(function RoomTableRoomJukebox(): ReactElement {
  const { table } = useRootStore();
  const lights = useRoomTableRoomJukebox(table.round.effects);

  return (
    <group position={[-1.95, -0.82, -3.4]} rotation-y={0.3}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.1, 1.4, 0.6]} />
        <meshStandardMaterial color={furniture.wood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.4, 0]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.55, 0.55, 0.6, 32, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color={furniture.wood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.4, 0.31]}>
        <torusGeometry args={[0.47, 0.035, 8, 48, Math.PI]} />
        <meshBasicMaterial ref={lights.outer} color={glow.pink} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.4, 0.31]}>
        <torusGeometry args={[0.36, 0.025, 8, 48, Math.PI]} />
        <meshBasicMaterial ref={lights.inner} color={glow.amber} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.75, 0.305]}>
        <planeGeometry args={[0.7, 0.5]} />
        <meshBasicMaterial color={glow.cyan} toneMapped={false} transparent opacity={0.35} />
      </mesh>
    </group>
  );
});
