import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { AdditiveBlending, DoubleSide, type CanvasTexture } from 'three';
import { cardSize } from '../../../../stores/table/body';
import type { RoundCardView } from '../../../../stores/table/round/cards';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture, glow } from '../palette';
import { useRoundFaceTexture } from '../use-textures';
import { useRoomTableRoundCardPointer } from './use-card-pointer';
import type { RoomTableRoundRegister } from './use-frames';

interface RoomTableRoundCardProps {
  view: RoundCardView;
  back: CanvasTexture | null;
  halo: CanvasTexture;
  register: RoomTableRoundRegister;
}

// One card in the round: a thin slab with the back on top and the face underneath (a back only,
// while nobody may see it), and behind it a halo that glows when it's yours and playable (D7).
export const RoomTableRoundCard = observer(function RoomTableRoundCard({ view, back, halo, register }: RoomTableRoundCardProps): ReactElement {
  const { art } = useRootStore();
  const face = useRoundFaceTexture(view.face, art.faceCanvas);
  const pointer = useRoomTableRoundCardPointer(view.key);

  return (
    <group ref={(group) => register(view.key, group)}>
      <mesh castShadow receiveShadow onPointerOver={pointer.over} onPointerOut={pointer.out} onPointerDown={pointer.down}>
        <boxGeometry args={[cardSize.width, cardSize.thickness, cardSize.depth]} />
        <meshStandardMaterial attach="material-0" color={furniture.cardEdge} roughness={0.6} />
        <meshStandardMaterial attach="material-1" color={furniture.cardEdge} roughness={0.6} />
        <meshStandardMaterial attach="material-2" map={back} alphaTest={0.5} roughness={0.35} />
        <meshStandardMaterial attach="material-3" map={face ?? back} alphaTest={0.5} roughness={0.35} emissive={furniture.cardEdge} emissiveMap={face ?? back} emissiveIntensity={0.28} />
        <meshStandardMaterial attach="material-4" color={furniture.cardEdge} roughness={0.6} />
        <meshStandardMaterial attach="material-5" color={furniture.cardEdge} roughness={0.6} />
        <mesh position={[0, cardSize.thickness, 0]} rotation-x={Math.PI / 2} visible={false}>
          <planeGeometry args={[cardSize.width * 1.3, cardSize.depth * 1.24]} />
          <meshBasicMaterial map={halo} color={glow.amber} toneMapped={false} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
        </mesh>
      </mesh>
    </group>
  );
});
