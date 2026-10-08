import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { paint } from '../../../art/palette';
import { useRootStore } from '../../../stores/use-root-store';
import { useRoomTableLights } from './use-lights';

// The hanging lamp's warm pool on the felt (spec §8.1), casting the cards' shadows; a warm room
// around it, lit enough to see the panelling and the furniture; the jukebox's pink and the pinball
// machine's cyan glowing at the back, the neon sign washing the wall pink; and a soft light from
// your side, so card faces read. The lamp's light swings with the lamp; with lighter graphics it
// casts no shadows.
export const RoomTableLights = observer(function RoomTableLights(): ReactElement {
  const { table, graphics } = useRootStore();
  const lamp = useRoomTableLights(table);

  return (
    <>
      <ambientLight intensity={0.42} color={paint.lamp} />
      <hemisphereLight args={[paint.lamp, paint.woodDeep, 0.55]} />
      <spotLight
        ref={lamp}
        position={[0, 4.2, 0.3]}
        angle={0.58}
        penumbra={0.8}
        intensity={62}
        decay={1.7}
        distance={12}
        color={paint.lamp}
        castShadow={!graphics.isLight}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.01}
      />
      <pointLight position={[-2.2, 0.7, -2.9]} color={paint.neonPink} intensity={12} distance={8} decay={2} />
      <pointLight position={[2.2, 0.7, -2.8]} color={paint.neonCyan} intensity={12} distance={8} decay={2} />
      <pointLight position={[0.3, 0.5, -3.9]} color={paint.neonPink} intensity={7} distance={5} decay={2} />
      <directionalLight position={[0, 3, 6]} intensity={0.45} color={paint.card} />
    </>
  );
});
