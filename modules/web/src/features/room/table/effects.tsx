import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import type { ReactElement } from 'react';

// The glow (spec §10.2): only things brighter than white bloom, so the neon, the jukebox and the
// pinball machine glow and the cards stay crisp. A vignette keeps the room's corners dark.
export function RoomTableEffects(): ReactElement {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={1.15} luminanceSmoothing={0.1} intensity={0.85} radius={0.7} />
      <Vignette offset={0.3} darkness={0.5} />
    </EffectComposer>
  );
}
