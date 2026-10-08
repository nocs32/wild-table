import type { ReactElement } from 'react';
import { AdditiveBlending } from 'three';
import { RoomTableRoomJukebox } from './jukebox';
import { furniture, glow } from './palette';
import { RoomTableRoomPinball } from './pinball';
import { useNeonTexture, usePanellingTexture } from './use-textures';

// The basement beyond the lamp's light (spec §8.1): carpet underfoot, walnut panelling at the back
// with the Wild Table neon sign on it, and the jukebox and the pinball machine glowing in the dark.
export function RoomTableRoom(): ReactElement {
  const panelling = usePanellingTexture();
  const neon = useNeonTexture();

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.82, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={furniture.floor} roughness={1} />
      </mesh>
      <mesh position={[0, 2.2, -4.6]}>
        <planeGeometry args={[24, 6]} />
        <meshStandardMaterial map={panelling} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.12, -4.55]}>
        <planeGeometry args={[2.8, 0.875]} />
        <meshBasicMaterial map={neon} color={glow.sign} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <RoomTableRoomJukebox />
      <RoomTableRoomPinball />
    </group>
  );
}
