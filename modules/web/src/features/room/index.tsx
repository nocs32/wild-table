import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { RoomChat } from './chat';
import { RoomDock } from './dock';
import { RoomFlights } from './flights';
import { RoomLobby } from './lobby';
import { RoomStatus } from './status';
import { RoomMain, RoomRoot, RoomScroll } from './styled-components';
import { RoomTopBar } from './top-bar';
import { useRoomArea } from './use-area';

// The whole page: the top bar, the table (with the floating chat and flying emoji over it), and the
// dock along the bottom. Until the table is open, a status card stands in. For now the table holds
// only the lobby; the 3D table comes with the game.
export const Room = observer(function Room(): ReactElement {
  const { room, ui } = useRootStore();
  const areaRef = useRoomArea(ui.widgets.area);

  if (!room.isOpen) {
    return <RoomStatus />;
  }

  return (
    <RoomRoot>
      <RoomTopBar />
      <RoomMain ref={areaRef}>
        <RoomScroll>
          <RoomLobby />
        </RoomScroll>
        {ui.widgets.showsChat && <RoomChat />}
        <RoomFlights />
      </RoomMain>
      <RoomDock />
    </RoomRoot>
  );
});
