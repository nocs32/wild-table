import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon, CloseIcon } from '../../../../assets';
import type { MarkedCardView } from '../../../../stores/rule-book/cards';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRuleBookCard } from './card';
import { RoomRuleBookCaption, RoomRuleBookMark, RoomRuleBookMarkedRoot } from './styled-components';

interface RoomRuleBookMarkedProps {
  card: MarkedCardView;
}

// A card with a ✅ or a ❌ worked out by the game's own rules, and why under it.
export const RoomRuleBookMarked = observer(function RoomRuleBookMarked({ card }: RoomRuleBookMarkedProps): ReactElement {
  const { locale } = useRootStore();

  return (
    <RoomRuleBookMarkedRoot>
      <RoomRuleBookCard card={card}>
        <RoomRuleBookMark fits={card.fits} role="img" aria-label={locale.t(card.fits ? 'book.fits' : 'book.noFit')}>
          {card.fits ? <CheckIcon /> : <CloseIcon />}
        </RoomRuleBookMark>
      </RoomRuleBookCard>
      <RoomRuleBookCaption>{card.note}</RoomRuleBookCaption>
    </RoomRuleBookMarkedRoot>
  );
});
