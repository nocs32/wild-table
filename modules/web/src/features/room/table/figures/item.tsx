import { Billboard } from '@react-three/drei';
import type { ReactElement } from 'react';
import { DoubleSide } from 'three';
import type { FigureView } from '../../../../stores/room/game/moods';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture } from '../palette';
import { heldHandSize, heldHandSpots, useRoomTableFiguresItemHands } from './use-hands';
import { figureHeight, figureWidth, useRoomTableFiguresItem } from './use-item';

interface RoomTableFiguresItemProps {
  view: FigureView;
}

// A player as a cardboard stick figure (spec §8), always turned to face you: hanging about the room
// in the lobby, then at their seat, eyes on whoever's turn it is, a face and a pose for how the
// game is treating them, and a 90s hat in their colour (bots wear a propeller beanie). It blinks, glances about, gestures, and
// on its turn lights up and holds its cards up, its hands over the fan.
export function RoomTableFiguresItem({ view }: RoomTableFiguresItemProps): ReactElement {
  const { table } = useRootStore();
  const { group, material, texture } = useRoomTableFiguresItem(view);
  const { group: hands, flip, texture: hand } = useRoomTableFiguresItemHands(view, table.round);

  return (
    <>
      <group ref={group}>
        <Billboard lockX lockZ>
          <mesh position={[0, figureHeight / 2, 0]}>
            <planeGeometry args={[figureWidth, figureHeight]} />
            <meshStandardMaterial ref={material} map={texture} alphaTest={0.5} emissive={furniture.cardEdge} emissiveMap={texture} emissiveIntensity={0.3} roughness={0.9} side={DoubleSide} />
          </mesh>
        </Billboard>
      </group>
      <group ref={hands} visible={false}>
        <Billboard>
          <group ref={flip}>
            {heldHandSpots.map((spot) => (
              <mesh key={spot.join()} position={spot}>
                <planeGeometry args={[heldHandSize, heldHandSize]} />
                <meshStandardMaterial map={hand} alphaTest={0.5} emissive={furniture.cardEdge} emissiveMap={hand} emissiveIntensity={0.3} roughness={0.9} side={DoubleSide} />
              </mesh>
            ))}
          </group>
        </Billboard>
      </group>
    </>
  );
}
