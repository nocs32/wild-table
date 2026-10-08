import { cardColours } from '@wild-table/protocol';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { pileSpot } from '../../../../stores/table/round/layout';
import { useRootStore } from '../../../../stores/use-root-store';
import { suitGlow } from '../palette';
import { useRoomTableRoundOrbs } from './use-orbs';

// Your Wild is down: four glowing orbs rise over the pile, one in each colour, and the one you
// click becomes the colour in play (spec §5.4). The turn's prompt has the same choice as buttons.
export const RoomTableRoundOrbs = observer(function RoomTableRoundOrbs(): ReactElement {
  const { room, table } = useRootStore();
  const orbs = useRoomTableRoundOrbs(table);

  return (
    <group position={[pileSpot.x, 0, pileSpot.z + 0.4]}>
      {cardColours.map((colour, index) => (
        <mesh
          key={colour}
          ref={orbs[index]}
          onPointerOver={() => table.hover({ kind: 'orb', colour })}
          onPointerOut={() => table.leave({ kind: 'orb', colour })}
          onClick={() => room.game.hand.pickColour(colour)}
        >
          <sphereGeometry args={[0.075, 24, 16]} />
          <meshBasicMaterial color={suitGlow[colour]} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
});
