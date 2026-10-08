import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundAnnouncementRoot, RoomRoundAnnouncementText } from './styled-components';

// "Your turn!" popping up over the table as your turn begins, so nobody misses it, sound or not.
export const RoomRoundAnnouncement = observer(function RoomRoundAnnouncement(): ReactElement {
  const { turn } = useRootStore().room.game;

  return (
    <RoomRoundAnnouncementRoot aria-hidden>
      <RoomRoundAnnouncementText>{turn.announcement}</RoomRoundAnnouncementText>
    </RoomRoundAnnouncementRoot>
  );
});
