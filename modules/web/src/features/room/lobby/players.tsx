import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LinkIcon, PlusIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button, GameCard } from '../../../ui';
import { RoomLobbyPlayersItem } from './players-item';
import { RoomLobbyHint, RoomLobbyPlayersAdd, RoomLobbyPlayersFoot, RoomLobbyPlayersList } from './styled-components';

// Everyone at the table, and the seats still free: add a bot, or bring people over with the link.
export const RoomLobbyPlayers = observer(function RoomLobbyPlayers(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { presence, seats, share } = room;

  return (
    <GameCard suit="blue" title={t('people.title')} subtitle={seats.countLabel}>
      <RoomLobbyPlayersList>
        {presence.views.map((player) => (
          <RoomLobbyPlayersItem key={player.id} player={player} />
        ))}
        {seats.canAddBot && (
          <li>
            <RoomLobbyPlayersAdd type="button" onClick={seats.addBot}>
              <PlusIcon />
              {t('lobby.addBot')}
            </RoomLobbyPlayersAdd>
          </li>
        )}
      </RoomLobbyPlayersList>
      <RoomLobbyPlayersFoot>
        <RoomLobbyHint>{seats.isFull ? t('lobby.full') : t('lobby.seatsHint')}</RoomLobbyHint>
        <RoomLobbyHint>{t('lobby.inviteHint')}</RoomLobbyHint>
        <Button tone="primary" type="button" onClick={share.copy}>
          <LinkIcon />
          {share.inviteLabel}
        </Button>
      </RoomLobbyPlayersFoot>
    </GameCard>
  );
});
