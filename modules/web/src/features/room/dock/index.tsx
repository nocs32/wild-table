import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomDockChat } from './chat';
import { RoomDockPicker } from './picker';
import { RoomDockQuick } from './quick';
import { RoomDockRoot, RoomDockSheet } from './styled-components';

// Reactions fly the whole time (spec §7): a click sends one, press and hold streams them. They sit
// on a sheet of stickers, and the chat is a folded note beside it.
export const RoomDock = observer(function RoomDock(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <RoomDockRoot role="toolbar" aria-label={locale.t('reactions.label')}>
      <RoomDockSheet>
        {room.reactions.quickButtons.map((button) => (
          <RoomDockQuick key={button.emoji} button={button} />
        ))}
        <RoomDockPicker />
      </RoomDockSheet>
      <RoomDockChat />
    </RoomDockRoot>
  );
});
