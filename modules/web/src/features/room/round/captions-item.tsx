import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { CaptionView } from '../../../stores/room/game/captions';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundCaptionsItemCards, RoomRoundCaptionsItemLink, RoomRoundCaptionsItemRoot } from './styled-components';

interface RoomRoundCaptionsItemProps {
  item: CaptionView;
}

// A caption: the line, any cards with it (the hand you challenged), and More, for the rule book's
// page about it (spec §9.1).
export const RoomRoundCaptionsItem = observer(function RoomRoundCaptionsItem({ item }: RoomRoundCaptionsItemProps): ReactElement {
  const { locale, ruleBook } = useRootStore();
  const page = item.page;

  return (
    <RoomRoundCaptionsItemRoot why={item.isWhy}>
      {item.text}
      {item.cards.length > 0 && (
        <RoomRoundCaptionsItemCards>
          {item.cards.map((card) => (card.url ? <img key={card.key} src={card.url} alt={card.label} title={card.label} /> : null))}
        </RoomRoundCaptionsItemCards>
      )}
      {page && (
        <RoomRoundCaptionsItemLink type="button" onClick={() => ruleBook.open(page)}>
          {locale.t('round.captions.more')}
        </RoomRoundCaptionsItemLink>
      )}
    </RoomRoundCaptionsItemRoot>
  );
});
