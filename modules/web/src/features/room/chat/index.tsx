import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ChatIcon, CloseIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { IconButton } from '../../../ui';
import { RoomChatComposer } from './composer';
import { RoomChatFeed } from './feed';
import { RoomChatHeader, RoomChatTitle } from './styled-components';
import { RoomChatWidget } from './widget';

// Felt Table's floating chat (spec §7): drag its header to move it, its corner to resize it.
// Chat isn't how you play here, so it stays out of the way of the board.
export const RoomChat = observer(function RoomChat(): ReactElement {
  const { locale, ui } = useRootStore();
  const { chat } = ui.widgets;

  return (
    <RoomChatWidget frame={chat} label={locale.t('chat.label')}>
      <RoomChatHeader data-widget-move>
        <RoomChatTitle>
          <ChatIcon />
          {locale.t('chat.label')}
        </RoomChatTitle>
        <IconButton type="button" aria-label={locale.t('chat.hide')} title={locale.t('chat.hide')} onClick={chat.hide}>
          <CloseIcon />
        </IconButton>
      </RoomChatHeader>
      <RoomChatFeed />
      <RoomChatComposer />
    </RoomChatWidget>
  );
});
