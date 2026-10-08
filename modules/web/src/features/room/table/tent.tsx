import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DoubleSide } from 'three';
import type { HouseRuleView } from '../../../stores/room/game/settings';
import { useRootStore } from '../../../stores/use-root-store';
import { furniture } from './palette';
import { tentShape, useRoomTableTentSpot } from './use-tent';
import { useRoomTablePoke } from './use-poke';
import { useTentTexture } from './use-textures';

interface RoomTableTentsItemProps {
  view: HouseRuleView;
  index: number;
  count: number;
}

// One tent card: folded card stock standing on the felt, the rule's name printed on the front.
// Click it for that rule's page in the rule book.
export const RoomTableTentsItem = observer(function RoomTableTentsItem({ view, index, count }: RoomTableTentsItemProps): ReactElement {
  const { ruleBook, table } = useRootStore();
  const texture = useTentTexture(view.name);
  const spot = useRoomTableTentSpot(index, count);
  const ref = useRoomTablePoke(table.hovered?.kind === 'tent' && table.hovered.rule === view.rule, true, 11 + index);
  const target = { kind: 'tent', rule: view.rule, name: view.name } as const;

  return (
    <group position={spot.position} rotation-y={spot.yaw}>
      <group ref={ref}>
        <mesh
          position={tentShape.front.position}
          rotation-x={tentShape.front.tilt}
          castShadow
          onPointerOver={() => table.hover(target)}
          onPointerOut={() => table.leave(target)}
          onClick={() => ruleBook.openHouseRule(view.rule)}
        >
          <planeGeometry args={[tentShape.width, tentShape.height]} />
          <meshStandardMaterial map={texture} roughness={0.4} />
        </mesh>
        <mesh position={tentShape.back.position} rotation-x={tentShape.back.tilt} castShadow>
          <planeGeometry args={[tentShape.width, tentShape.height]} />
          <meshStandardMaterial color={furniture.cardEdge} roughness={0.5} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  );
});
