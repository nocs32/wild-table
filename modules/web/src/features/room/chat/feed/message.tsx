import type { ReactElement } from 'react';
import type { FeedEntry } from '../../../../stores/room/feed';
import { Avatar } from '../../../../ui';
import {
  RoomChatFeedAuthor,
  RoomChatFeedGutter,
  RoomChatFeedMessageRoot,
  RoomChatFeedMeta,
  RoomChatFeedText,
  RoomChatFeedTime,
} from './styled-components';

interface RoomChatFeedMessageProps {
  entry: FeedEntry;
}

export function RoomChatFeedMessage({ entry }: RoomChatFeedMessageProps): ReactElement {
  return (
    <RoomChatFeedMessageRoot startsGroup={entry.startsGroup}>
      <RoomChatFeedGutter>
        {entry.startsGroup && <Avatar initial={entry.authorInitial} color={entry.authorColor} size="lg" />}
      </RoomChatFeedGutter>
      <div>
        {entry.startsGroup && (
          <RoomChatFeedMeta>
            <RoomChatFeedAuthor>{entry.authorName}</RoomChatFeedAuthor>
            <RoomChatFeedTime>{entry.timeLabel}</RoomChatFeedTime>
          </RoomChatFeedMeta>
        )}
        <RoomChatFeedText>{entry.text}</RoomChatFeedText>
      </div>
    </RoomChatFeedMessageRoot>
  );
}
