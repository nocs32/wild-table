import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomDockChat } from './chat';
import { RoomDockPicker } from './picker';
import { RoomDockQuick } from './quick';
import { RoomDockRoot, RoomDockChips } from './styled-components';

// Reactions fly the whole time (spec §7): a click sends one, press and hold streams them. They sit
// in a row of poker chips on the table's rail, and the chat button is beside them. On a phone held
// sideways the rail stands up along the left edge, to leave the height to the table.
export const RoomDock = observer(function RoomDock(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { isCompact } = ui.layout;

  return (
    <RoomDockRoot role="toolbar" aria-label={locale.t('reactions.label')} aria-orientation={isCompact ? 'vertical' : 'horizontal'} rail={isCompact} data-rail={isCompact || undefined}>
      <RoomDockChips rail={isCompact}>
        {room.reactions.quickButtons.map((button) => (
          <RoomDockQuick key={button.emoji} button={button} />
        ))}
        <RoomDockPicker />
      </RoomDockChips>
      <RoomDockChat />
    </RoomDockRoot>
  );
});
