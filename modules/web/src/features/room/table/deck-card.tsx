import type { CardFace } from '@wild-table/protocol';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { CanvasTexture } from 'three';
import { cardSize } from '../../../stores/table/body';
import { useRootStore } from '../../../stores/use-root-store';
import { furniture } from './palette';
import type { RoomTableDeckRegister } from './use-deck';
import { useRoomTableCardPointer } from './use-card-pointer';
import { useCardFaceTexture } from './use-textures';

interface RoomTableDeckCardProps {
  id: number;
  face: CardFace;
  back: CanvasTexture | null;
  register: RoomTableDeckRegister;
}

// One card: a thin slab with the back on top and the face underneath, cream along its edges. The
// rounded corners come from the art's transparent corners.
export const RoomTableDeckCard = observer(function RoomTableDeckCard({ id, face, back, register }: RoomTableDeckCardProps): ReactElement {
  const { art } = useRootStore();
  const faceTexture = useCardFaceTexture(art.faceCanvas(face));
  const pointer = useRoomTableCardPointer(id);

  return (
    <group ref={(group) => register(id, group)}>
      <mesh castShadow receiveShadow onPointerOver={pointer.over} onPointerOut={pointer.out} onPointerDown={pointer.down}>
        <boxGeometry args={[cardSize.width, cardSize.thickness, cardSize.depth]} />
        <meshStandardMaterial attach="material-0" color={furniture.cardEdge} roughness={0.6} />
        <meshStandardMaterial attach="material-1" color={furniture.cardEdge} roughness={0.6} />
        <meshStandardMaterial attach="material-2" map={back} alphaTest={0.5} roughness={0.35} />
        <meshStandardMaterial attach="material-3" map={faceTexture} alphaTest={0.5} roughness={0.35} />
        <meshStandardMaterial attach="material-4" color={furniture.cardEdge} roughness={0.6} />
        <meshStandardMaterial attach="material-5" color={furniture.cardEdge} roughness={0.6} />
      </mesh>
    </group>
  );
});
