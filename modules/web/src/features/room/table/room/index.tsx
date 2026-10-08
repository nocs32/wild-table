import type { ReactElement } from 'react';
import { AdditiveBlending } from 'three';
import { furniture, glow } from '../palette';
import { useNeonTexture, usePanellingTexture } from '../use-textures';
import { RoomTableRoomBoombox } from './boombox';
import { RoomTableRoomCouch } from './couch';
import { RoomTableRoomFloorLamp } from './floor-lamp';
import { RoomTableRoomJukebox } from './jukebox';
import { RoomTableRoomLamp } from './lamp';
import { RoomTableRoomLava } from './lava';
import { RoomTableRoomPinball } from './pinball';
import { RoomTableRoomPizza } from './pizza';
import { RoomTableRoomRug } from './rug';

// The basement round the table (spec §8.1): the stained-glass lamp hanging over it, a shag rug
// under it, walnut panelling at the back with the Wild Table neon sign over a loveseat, the jukebox
// and the pinball machine glowing in the dark, a standing lamp in the corner, and things to poke
// while you wait: a boombox, a box of cold pizza and a lava lamp.
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
        <meshBasicMaterial map={neon} color={glow.sign} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      <RoomTableRoomRug />
      <RoomTableRoomCouch />
      <RoomTableRoomJukebox />
      <RoomTableRoomPinball />
      <RoomTableRoomFloorLamp />
      <RoomTableRoomLamp />
      <RoomTableRoomLava />
      <RoomTableRoomBoombox />
      <RoomTableRoomPizza />
    </group>
  );
}
