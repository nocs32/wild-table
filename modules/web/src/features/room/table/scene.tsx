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
import { RoomTableTents } from './tents';
import { useRoomTableCamera } from './use-camera';
import { useRoomTablePointer } from './use-pointer';

// The basement (spec §8.1): the card table in the lamp's pool of light, the room falling into
// shadow around it, and on the felt the deck, the rule leaflet and the house rules' tent cards.
// Things drawn with the card art wait until it's ready.
export const RoomTableScene = observer(function RoomTableScene(): ReactElement {
  const { art, table } = useRootStore();

  useRoomTableCamera(table.insetLeft, table.insetRight);
  useRoomTablePointer(table);

  return (
    <>
      <color attach="background" args={[paint.woodDeep]} />
      <fog attach="fog" args={[paint.woodDeep, 6, 15]} />
      <RoomTableLights />
      <RoomTableRoom />
      <RoomTableFurniture />
      {art.isReady && (
        <>
          <RoomTableDeck />
          <RoomTableLeaflet />
          <RoomTableTents />
        </>
      )}
      <RoomTableEffects />
    </>
  );
});
