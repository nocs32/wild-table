import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LinkIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomLobbyInviteButtons, RoomLobbyInviteHint, RoomLobbyInviteRoot } from './styled-components';

// The table's link, to bring people over. Start joins it here once there's a game (spec §4.2).
export const RoomLobbySettingsInvite = observer(function RoomLobbySettingsInvite(): ReactElement {
  const { locale, room } = useRootStore();
  const { share } = room;

  return (
    <RoomLobbyInviteRoot>
      <RoomLobbyInviteHint>{locale.t('lobby.inviteHint')}</RoomLobbyInviteHint>
      <RoomLobbyInviteButtons>
        <Button tone="primary" type="button" onClick={share.copy}>
          <LinkIcon />
          {share.inviteLabel}
        </Button>
      </RoomLobbyInviteButtons>
    </RoomLobbyInviteRoot>
  );
});
