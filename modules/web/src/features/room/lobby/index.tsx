import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomLobbyMatch } from './match';
import { RoomLobbyPlayers } from './players';
import { RoomLobbyRules } from './rules';
import { RoomLobbyStart } from './start';
import { RoomLobbyRoot, RoomLobbySide } from './styled-components';
import { useRoomLobbyInsets } from './use-insets';

// While people gather (spec §4.2): who's at the table on one side, the table's rules on the other,
// and between them the card table itself, with Start. On a phone held sideways Start and all the
// cards share one column beside the table, so nothing covers it (spec §9.2).
export const RoomLobby = observer(function RoomLobby(): ReactElement {
  const { table, ui } = useRootStore();
  const { isCompact } = ui.layout;
  const ref = useRoomLobbyInsets(table, isCompact);

  return (
    <RoomLobbyRoot ref={ref} compact={isCompact}>
      {!isCompact && (
        <RoomLobbySide side="left" data-side="left">
          <RoomLobbyPlayers />
        </RoomLobbySide>
      )}
      {!isCompact && <RoomLobbyStart />}
      <RoomLobbySide side="right" data-side="right">
        {isCompact && <RoomLobbyStart />}
        {isCompact && <RoomLobbyPlayers />}
        <RoomLobbyMatch />
        <RoomLobbyRules />
      </RoomLobbySide>
    </RoomLobbyRoot>
  );
});
