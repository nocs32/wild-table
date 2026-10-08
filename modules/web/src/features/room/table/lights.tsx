import type { ReactElement } from 'react';
import { paint } from '../../../art/palette';

// The hanging lamp's warm pool on the felt (spec §8.1), casting the cards' shadows; a dim warm room
// around it; the jukebox's pink and the pinball machine's cyan glowing at the back; and a soft
// light from your side, so card faces read.
export function RoomTableLights(): ReactElement {
  return (
    <>
      <ambientLight intensity={0.28} color={paint.lamp} />
      <spotLight
        position={[0, 4.2, 0.3]}
        angle={0.5}
        penumbra={0.75}
        intensity={55}
        decay={1.7}
        distance={12}
        color={paint.lamp}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.01}
      />
      <pointLight position={[-2.2, 0.7, -2.9]} color={paint.neonPink} intensity={9} distance={7} decay={2} />
      <pointLight position={[2.2, 0.7, -2.8]} color={paint.neonCyan} intensity={9} distance={7} decay={2} />
      <directionalLight position={[0, 3, 6]} intensity={0.35} color={paint.card} />
    </>
  );
}
