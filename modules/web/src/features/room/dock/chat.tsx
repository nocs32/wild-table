import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ChatIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomDockBadge, RoomDockChatButton, RoomDockChatLabel } from './styled-components';

// Opens and closes the floating chat, with the number of messages that came in while it was closed.
export const RoomDockChat = observer(function RoomDockChat(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { feed } = room;

  return (
    <RoomDockChatButton type="button" aria-pressed={ui.widgets.chat.isOpen} aria-label={locale.t('chat.toggle')} title={locale.t('chat.toggle')} onClick={room.toggleChat}>
      <ChatIcon />
      <RoomDockChatLabel>{locale.t('chat.label')}</RoomDockChatLabel>
      {feed.unreadCount > 0 && (
        <RoomDockBadge key={feed.unreadCount} aria-label={locale.t('chat.unread', { count: feed.unreadCount })}>
          {feed.unreadLabel}
        </RoomDockBadge>
      )}
    </RoomDockChatButton>
  );
});
