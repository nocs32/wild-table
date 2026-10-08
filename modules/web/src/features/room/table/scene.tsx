import { PerformanceMonitor } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { paint } from '../../../art/palette';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableDeck } from './deck';
import { RoomTableEffects } from './effects';
import { RoomTableFurniture } from './furniture';
import { RoomTableLeaflet } from './leaflet';
import { RoomTableLights } from './lights';
import { RoomTableRoom } from './room';
import { RoomTableRound } from './round';
import { RoomTableTents } from './tents';
import { useRoomTableCamera } from './use-camera';
import { useRoomTablePointer } from './use-pointer';
import { useRoomTableShake } from './use-shake';

// Below 40 frames a second for a while, the graphics get lighter by themselves (spec §8.3).
const performanceBounds = (): [number, number] => [40, 1000];

// The basement (spec §8.1): the card table in the lamp's pool of light, the room falling into
// shadow around it, and on the felt the rule leaflet, the house rules' tent cards, and the deck to
// play with in the lobby or the round being played. Things drawn with the card art wait until it's
// ready. With lighter graphics there's no glow (spec §8.3).
export const RoomTableScene = observer(function RoomTableScene(): ReactElement {
  const { art, table, graphics } = useRootStore();

  const camera = useRoomTableCamera({ left: table.insetLeft, right: table.insetRight, bottomShare: table.bottomShare, margin: table.cameraMargin });

  useRoomTableShake(table.round.effects, camera);
  useRoomTablePointer(table);

  return (
    <>
      <color attach="background" args={[paint.woodDeep]} />
      <fog attach="fog" args={[paint.woodDeep, 8, 20]} />
      <RoomTableLights />
      <RoomTableRoom />
      <RoomTableFurniture />
      {art.isReady && (
        <>
          {table.round.isShown ? <RoomTableRound /> : <RoomTableDeck />}
          <RoomTableLeaflet />
          <RoomTableTents />
        </>
      )}
      {!graphics.isLight && <RoomTableEffects />}
      <PerformanceMonitor bounds={performanceBounds} onDecline={graphics.drop} />
    </>
  );
});
