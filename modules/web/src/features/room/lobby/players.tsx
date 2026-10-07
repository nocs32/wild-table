import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { UsersIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Avatar } from '../../../ui';
import {
  RoomLobbyCard,
  RoomLobbyCardTitle,
  RoomLobbyPlayersItem,
  RoomLobbyPlayersList,
  RoomLobbyPlayersName,
  RoomLobbyPlayersNote,
  RoomLobbyPlayersSheet,
} from './styled-components';

// Everyone at the table.
export const RoomLobbyPlayers = observer(function RoomLobbyPlayers(): ReactElement {
  const { locale, room } = useRootStore();
  const { presence } = room;

  return (
    <RoomLobbyCard area="players" aria-label={locale.t('players.label')}>
      <RoomLobbyPlayersSheet>
        <RoomLobbyCardTitle>
          <UsersIcon />
          {presence.countLabel}
        </RoomLobbyCardTitle>
        <RoomLobbyPlayersList>
          {presence.views.map((player) => (
            <RoomLobbyPlayersItem key={player.id}>
              <Avatar initial={player.initial} color={player.color} size="lg" presence={player.status} />
              <RoomLobbyPlayersName>{player.name}</RoomLobbyPlayersName>
              {player.note && <RoomLobbyPlayersNote>{player.note}</RoomLobbyPlayersNote>}
            </RoomLobbyPlayersItem>
          ))}
        </RoomLobbyPlayersList>
      </RoomLobbyPlayersSheet>
    </RoomLobbyCard>
  );
});
