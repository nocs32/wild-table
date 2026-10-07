import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { RoomLobbyPlayers } from './players';
import { RoomLobbySettings } from './settings';
import { RoomLobbyRoot } from './styled-components';

// While people gather (spec §4.2): who's here, and the settings. Seats around the 3D table, bots
// and Start come with the game.
export const RoomLobby = observer(function RoomLobby(): ReactElement {
  return (
    <RoomLobbyRoot>
      <RoomLobbyPlayers />
      <RoomLobbySettings />
    </RoomLobbyRoot>
  );
});
