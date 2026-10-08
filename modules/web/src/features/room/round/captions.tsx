import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundCaptionsItem } from './captions-item';
import { RoomRoundCaptionsList } from './styled-components';

// What just happened, a line at a time (spec D7), and why a card can't be played.
export const RoomRoundCaptions = observer(function RoomRoundCaptions(): ReactElement {
  const { captions } = useRootStore().room.game;

  return (
    <RoomRoundCaptionsList aria-live="polite">
      {captions.items.map((item) => (
        <RoomRoundCaptionsItem key={item.id} item={item} />
      ))}
    </RoomRoundCaptionsList>
  );
});
