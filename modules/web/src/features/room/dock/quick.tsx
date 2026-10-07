import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { QuickReactionView } from '../../../stores/room/reactions';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomDockEmoji } from './styled-components';

interface RoomDockQuickProps {
  button: QuickReactionView;
}

// Click an emoji to send one; press and hold to stream them.
export const RoomDockQuick = observer(function RoomDockQuick({ button }: RoomDockQuickProps): ReactElement {
  const { reactions } = useRootStore().room;

  return (
    <RoomDockEmoji
      type="button"
      aria-label={button.label}
      title={button.label}
      onPointerDown={() => reactions.startStream(button.emoji)}
      onPointerUp={reactions.stopStream}
      onPointerLeave={reactions.stopStream}
      onPointerCancel={reactions.stopStream}
      onClick={(event) => reactions.fireFromKeyboard(button.emoji, event.detail)}
    >
      {button.emoji}
    </RoomDockEmoji>
  );
});
