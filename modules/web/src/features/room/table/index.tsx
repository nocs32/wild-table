import { Canvas } from '@react-three/fiber';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableScene } from './scene';
import { RoomTableRoot } from './styled-components';

// The 3D card table under everything (spec D4, §8): React Three Fiber draws it, and the lobby, the
// chat and the flying emoji float over it as HTML.
export const RoomTable = observer(function RoomTable(): ReactElement {
  const { locale, table } = useRootStore();

  return (
    <RoomTableRoot aria-label={locale.t('table.label')}>
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        camera={{ fov: 34, near: 0.1, far: 40, position: [0, 4, 5] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={table.round.hand.deselect}
      >
        <RoomTableScene />
      </Canvas>
    </RoomTableRoot>
  );
});
