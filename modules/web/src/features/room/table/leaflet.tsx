import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { useRoomTablePoke } from './use-poke';
import { useLeafletTexture } from './use-textures';

// The rule leaflet lying on the felt (spec §9.1): click it to open the rule book.
export const RoomTableLeaflet = observer(function RoomTableLeaflet(): ReactElement {
  const { locale, ruleBook, table } = useRootStore();
  const texture = useLeafletTexture(locale.t('book.title'), locale.t('book.new'));
  const ref = useRoomTablePoke(table.hovered?.kind === 'leaflet');

  return (
    <group position={[-0.72, 0.012, 0.42]} rotation-y={0.3}>
      <group ref={ref}>
        <mesh
          rotation-x={-Math.PI / 2}
          castShadow
          receiveShadow
          onPointerOver={() => table.hover({ kind: 'leaflet' })}
          onPointerOut={() => table.leave({ kind: 'leaflet' })}
          onClick={() => ruleBook.open('goal')}
        >
          <planeGeometry args={[0.36, 0.5]} />
          <meshStandardMaterial map={texture} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
});
