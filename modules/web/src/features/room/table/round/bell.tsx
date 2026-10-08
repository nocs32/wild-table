import { Html } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { BellIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { furniture } from '../palette';
import { RoomTableRoundBellSign } from './styled-components';
import { useRoomTableRoundBell } from './use-bell';

// Where the bell stands: on the felt at your right, between you and the next seat.
const spot: [number, number, number] = [1.22, 0, 0.5];

// The Last card! desk bell (spec §5.6, §8.1). It lights up for everyone when someone's down to one
// card. On your turn, instead of playing, you can smack it once a round: everyone else on one card
// draws 2, and you draw 1. A sign says so when it's yours to hit. Ding!
export const RoomTableRoundBell = observer(function RoomTableRoundBell(): ReactElement {
  const { locale, room, table } = useRootStore();
  const { hand, turn } = room.game;
  const refs = useRoomTableRoundBell(table.round, room.game.match.isBellLit, hand.canRing);

  return (
    <group position={spot}>
      <mesh position={[0, 0.018, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.11, 0.036, 32]} />
        <meshStandardMaterial color={furniture.wood} roughness={0.5} />
      </mesh>
      <group ref={refs.bell}>
        <mesh ref={refs.dome} position={[0, 0.036, 0]} castShadow>
          <sphereGeometry args={[0.085, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={furniture.brass} metalness={0.85} roughness={0.25} emissive={furniture.brass} emissiveIntensity={0} />
        </mesh>
        <mesh position={[0, 0.13, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.016, 0.03, 12]} />
          <meshStandardMaterial color={furniture.brass} metalness={0.85} roughness={0.3} />
        </mesh>
      </group>
      <mesh
        position={[0, 0.08, 0]}
        onPointerOver={() => table.hover({ kind: 'bell' })}
        onPointerOut={() => table.leave({ kind: 'bell' })}
        onClick={hand.ring}
      >
        <sphereGeometry args={[0.2, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hand.canRing && (
        <Html position={[0, 0.3, 0]} center zIndexRange={[30, 20]}>
          <RoomTableRoundBellSign type="button" onClick={hand.ring} title={turn.bellLine}>
            <BellIcon />
            {locale.t('round.bell.label')}
          </RoomTableRoundBellSign>
        </Html>
      )}
    </group>
  );
});
