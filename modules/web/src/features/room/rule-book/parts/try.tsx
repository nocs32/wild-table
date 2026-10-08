import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { PlayIcon, ResetIcon } from '../../../../assets';
import type { RuleBookTryStore } from '../../../../stores/rule-book/try';
import { useRootStore } from '../../../../stores/use-root-store';
import { Button } from '../../../../ui';
import { RoomRuleBookCard } from './card';
import {
  RoomRuleBookGroup,
  RoomRuleBookGroupLabel,
  RoomRuleBookPile,
  RoomRuleBookRow,
  RoomRuleBookTryCard,
  RoomRuleBookTryFoot,
  RoomRuleBookTryMessage,
  RoomRuleBookTryRoot,
  RoomRuleBookTryTitle,
} from './styled-components';
import { useRoomRuleBookTryDrag } from './use-try-drag';

interface RoomRuleBookTryProps {
  store: RuleBookTryStore;
}

// "Try it" (spec §9.1): drag a card onto the pile, or click it, and it says whether it fits and
// why. A card that fits lands on the pile; one that doesn't shakes its head.
export const RoomRuleBookTry = observer(function RoomRuleBookTry({ store }: RoomRuleBookTryProps): ReactElement {
  const { t } = useRootStore().locale;
  const drag = useRoomRuleBookTryDrag(store);

  return (
    <RoomRuleBookTryRoot>
      <RoomRuleBookTryTitle>
        <PlayIcon />
        {t('book.try.title')}
      </RoomRuleBookTryTitle>
      <RoomRuleBookRow>
        <RoomRuleBookGroup>
          <RoomRuleBookGroupLabel>{t('book.try.pile')}</RoomRuleBookGroupLabel>
          <RoomRuleBookPile target={drag.isOver} {...drag.pile}>
            <RoomRuleBookCard card={store.topCard} />
          </RoomRuleBookPile>
        </RoomRuleBookGroup>
        <RoomRuleBookGroup>
          <RoomRuleBookGroupLabel>{t('book.try.hand')}</RoomRuleBookGroupLabel>
          <RoomRuleBookRow>
            {store.handCards.map((card) => (
              <RoomRuleBookTryCard key={card.key} type="button" aria-label={card.label} onClick={() => store.play(card.id)} {...drag.card(card.id)}>
                <RoomRuleBookCard card={card} shake={card.shaking} />
              </RoomRuleBookTryCard>
            ))}
          </RoomRuleBookRow>
        </RoomRuleBookGroup>
      </RoomRuleBookRow>
      <RoomRuleBookTryFoot>
        <RoomRuleBookTryMessage role="status">{store.isEmpty ? t('book.try.empty') : store.message}</RoomRuleBookTryMessage>
        {store.canReset && (
          <Button tone="secondary" size="sm" type="button" onClick={store.reset}>
            <ResetIcon />
            {t('book.try.reset')}
          </Button>
        )}
      </RoomRuleBookTryFoot>
    </RoomRuleBookTryRoot>
  );
});
