import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { AdditiveBlending } from 'three';
import { pileSpot } from '../../../../stores/table/round/layout';
import { useRootStore } from '../../../../stores/use-root-store';
import { glow } from '../palette';
import { useDirectionRingTexture } from '../use-textures';
import { useRoomTableRoundPile } from './use-pile';

// The middle of the table under the pile (spec §8.1, §9): the colour in play glowing in the felt,
// the arrow ring showing which way play goes, and the ring of air a slap sends out. The pile itself
// is cards; this is the spot you drop them on, and clicking it plays the card you picked.
export const RoomTableRoundPile = observer(function RoomTableRoundPile(): ReactElement {
  const { table } = useRootStore();
  const texture = useDirectionRingTexture();
  const refs = useRoomTableRoundPile(table.round);

  return (
    <group position={[pileSpot.x, 0, pileSpot.z]}>
      <mesh ref={refs.glow} rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.42, 48]} />
        <meshBasicMaterial color={glow.card} toneMapped={false} transparent opacity={0.2} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={refs.ring} position={[0, 0.0015, 0]}>
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1.12, 1.12]} />
          <meshBasicMaterial map={texture} color={glow.card} toneMapped={false} transparent opacity={0.7} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={refs.wave} rotation-x={-Math.PI / 2} position={[0, 0.003, 0]} visible={false}>
        <ringGeometry args={[0.3, 0.36, 64]} />
        <meshBasicMaterial color={glow.card} toneMapped={false} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.004, 0]}
        onPointerOver={() => table.hover({ kind: 'pile' })}
        onPointerOut={() => table.leave({ kind: 'pile' })}
        onClick={table.round.hand.clickPile}
      >
        <circleGeometry args={[0.34, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
});
