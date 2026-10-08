import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CloseIcon } from '../../../assets';
import type { PlayerView } from '../../../stores/room/presence';
import { useRootStore } from '../../../stores/use-root-store';
import { Avatar, IconButton } from '../../../ui';
import { RoomLobbyPlayersItemRoot, RoomLobbyPlayersName, RoomLobbyPlayersNote, RoomLobbyPlayersText } from './styled-components';

interface RoomLobbyPlayersItemProps {
  player: PlayerView;
}

// One player: their chip, name and note. A bot can be sent away from here.
export const RoomLobbyPlayersItem = observer(function RoomLobbyPlayersItem({ player }: RoomLobbyPlayersItemProps): ReactElement {
  const { locale, room } = useRootStore();
  const removeLabel = locale.t('lobby.removeBot', { name: player.name });

  return (
    <RoomLobbyPlayersItemRoot me={player.isMe}>
      <Avatar initial={player.initial} color={player.color} size="lg" presence={player.isBot ? undefined : player.status} bot={player.isBot} />
      <RoomLobbyPlayersText>
        <RoomLobbyPlayersName>{player.name}</RoomLobbyPlayersName>
        {player.note && <RoomLobbyPlayersNote>{player.note}</RoomLobbyPlayersNote>}
      </RoomLobbyPlayersText>
      {player.isBot && room.seats.canRemoveBots && (
        <IconButton surface="print" type="button" aria-label={removeLabel} title={removeLabel} onClick={() => room.seats.removeBot(player.id)}>
          <CloseIcon />
        </IconButton>
      )}
    </RoomLobbyPlayersItemRoot>
  );
});
