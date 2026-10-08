import { Billboard } from '@react-three/drei';
import type { ReactElement } from 'react';
import { DoubleSide } from 'three';
import type { FigureView } from '../../../../stores/room/game/moods';
import { furniture } from '../palette';
import { figureHeight, figureWidth, useRoomTableRoundFigure } from './use-figure';

interface RoomTableRoundFigureProps {
  view: FigureView;
}

// Another player as a cardboard stick figure standing at their seat (spec §8), always turned to
// face you: eyes on whoever's turn it is, a face and a pose for how the game is treating them, and
// a 90s hat in their colour (bots wear a propeller beanie).
export function RoomTableRoundFigure({ view }: RoomTableRoundFigureProps): ReactElement {
  const { group, texture } = useRoomTableRoundFigure(view);

  return (
    <group ref={group}>
      <Billboard lockX lockZ>
        <mesh position={[0, figureHeight / 2, 0]}>
          <planeGeometry args={[figureWidth, figureHeight]} />
          <meshStandardMaterial map={texture} alphaTest={0.5} emissive={furniture.cardEdge} emissiveMap={texture} emissiveIntensity={0.3} roughness={0.9} side={DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  );
}
