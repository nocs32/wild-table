import type { ReactElement } from 'react';
import type { FeedEntry } from '../../../../stores/room/feed';
import { Avatar } from '../../../../ui';
import { RoomChatFeedGutter, RoomChatFeedSystemName, RoomChatFeedSystemRoot, RoomChatFeedTime } from './styled-components';

interface RoomChatFeedSystemProps {
  entry: FeedEntry;
}

// Activity lines like Slack's "joined #channel": small, muted, with the person's avatar.
export function RoomChatFeedSystem({ entry }: RoomChatFeedSystemProps): ReactElement {
  return (
    <RoomChatFeedSystemRoot>
      <RoomChatFeedGutter>
        <Avatar initial={entry.authorInitial} color={entry.authorColor} size="sm" />
      </RoomChatFeedGutter>
      <span>
        <RoomChatFeedSystemName>{entry.authorName}</RoomChatFeedSystemName> {entry.text}
      </span>
      <RoomChatFeedTime>{entry.timeLabel}</RoomChatFeedTime>
    </RoomChatFeedSystemRoot>
  );
}
