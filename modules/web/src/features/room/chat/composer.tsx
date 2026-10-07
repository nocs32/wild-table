import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { SendIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { withoutDefault } from '../../../utils';
import { RoomChatComposerInput, RoomChatComposerNote, RoomChatComposerRoot, RoomChatComposerSend } from './styled-components';

export const RoomChatComposer = observer(function RoomChatComposer(): ReactElement {
  const { locale, room } = useRootStore();
  const { feed, chatPace } = room;

  return (
    <>
      {chatPace.note && <RoomChatComposerNote role="status">{chatPace.note}</RoomChatComposerNote>}
      <RoomChatComposerRoot onSubmit={withoutDefault(feed.send)}>
        <RoomChatComposerInput
          value={feed.draft}
          placeholder={locale.t('chat.placeholder')}
          aria-label={locale.t('chat.message')}
          maxLength={feed.maxLength}
          onChange={(event) => feed.setDraft(event.target.value)}
        />
        <RoomChatComposerSend type="submit" disabled={feed.isDraftEmpty} ready={feed.canSend} aria-label={locale.t('chat.send')}>
          <SendIcon />
        </RoomChatComposerSend>
      </RoomChatComposerRoot>
    </>
  );
});
