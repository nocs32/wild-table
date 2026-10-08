import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { BookIcon, PlayIcon, ShuffleIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomLobbyStartHint, RoomLobbyStartLink, RoomLobbyStartPrompt, RoomLobbyStartRoot } from './styled-components';

// Start, in the middle under the deck (spec §4.2): it needs two seats filled, and says so. Until
// someone plays with the deck, a line says it's there to play with; the rules are one click away
// for anyone new (spec D7, §9.1).
export const RoomLobbyStart = observer(function RoomLobbyStart(): ReactElement {
  const { locale, room, ruleBook, table, ui } = useRootStore();
  const { t } = locale;
  const { seats } = room;

  return (
    <RoomLobbyStartRoot compact={ui.layout.isCompact}>
      {!table.deck.hasPlayed && (
        <RoomLobbyStartPrompt>
          <ShuffleIcon />
          {t('table.deckPrompt')}
        </RoomLobbyStartPrompt>
      )}
      <Button tone="primary" size={ui.layout.isCompact ? 'md' : 'lg'} type="button" disabled={!seats.isReady} onClick={room.game.start}>
        <PlayIcon />
        {t('lobby.start')}
      </Button>
      <RoomLobbyStartHint role="status">{seats.isReady ? t('lobby.startSoon') : t('lobby.startNeedsPlayers')}</RoomLobbyStartHint>
      <RoomLobbyStartLink type="button" onClick={() => ruleBook.open('goal')}>
        <BookIcon />
        {t('lobby.rulesLink')}
      </RoomLobbyStartLink>
    </RoomLobbyStartRoot>
  );
});
