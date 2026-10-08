import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DoubleSide, type CanvasTexture } from 'three';
import { cardSize } from '../../../../stores/table/body';
import { deckSpot, deckTop } from '../../../../stores/table/round/layout';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture, glow } from '../palette';

interface RoomTableRoundDeckProps {
  back: CanvasTexture | null;
}

// The deck in a round: a stack as tall as the cards left in it, the top card's back showing. On
// your turn it glows, and a click draws a card (spec §5.3).
export const RoomTableRoundDeck = observer(function RoomTableRoundDeck({ back }: RoomTableRoundDeckProps): ReactElement {
  const { room, table } = useRootStore();
  const { hand } = room.game;
  const height = deckTop(table.round.deckSize);

  return (
    <group position={[deckSpot.x, 0, deckSpot.z]}>
      <mesh
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        onPointerOver={() => table.hover({ kind: 'roundDeck' })}
        onPointerOut={() => table.leave({ kind: 'roundDeck' })}
        onClick={hand.draw}
      >
        <boxGeometry args={[cardSize.width, height, cardSize.depth]} />
        <meshStandardMaterial attach="material-0" color={furniture.cardEdge} roughness={0.7} />
        <meshStandardMaterial attach="material-1" color={furniture.cardEdge} roughness={0.7} />
        <meshStandardMaterial attach="material-2" map={back} alphaTest={0.5} roughness={0.35} />
        <meshStandardMaterial attach="material-3" color={furniture.cardEdge} />
        <meshStandardMaterial attach="material-4" color={furniture.cardEdge} roughness={0.7} />
        <meshStandardMaterial attach="material-5" color={furniture.cardEdge} roughness={0.7} />
      </mesh>
      {hand.canDraw && (
        <mesh position={[0, 0.002, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[cardSize.width * 1.3, cardSize.depth * 1.22]} />
          <meshBasicMaterial color={glow.amber} toneMapped={false} transparent opacity={0.55} depthWrite={false} side={DoubleSide} />
        </mesh>
      )}
    </group>
  );
});
