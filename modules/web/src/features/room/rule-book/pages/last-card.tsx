import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon, CloseIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRuleBookCard } from '../parts';
import { RoomRuleBookLead, RoomRuleBookText } from '../styled-components';
import { RoomRuleBookBell, RoomRuleBookBellKnob, RoomRuleBookBellLabel, RoomRuleBookBellShape, RoomRuleBookBox, RoomRuleBookBoxTitle, RoomRuleBookPair } from './styled-components';

// Page 5, Last card! (spec §5.6): the desk bell, a block on your own turn, and what it costs.
export const RoomRuleBookPageLastCard = observer(function RoomRuleBookPageLastCard(): ReactElement {
  const { locale, ruleBook } = useRootStore();
  const { t } = locale;

  return (
    <>
      <RoomRuleBookLead>{t('book.lastCard.lead')}</RoomRuleBookLead>
      <RoomRuleBookBell>
        <RoomRuleBookCard card={ruleBook.lastCard} size="sm" />
        <RoomRuleBookBellShape aria-hidden>
          <RoomRuleBookBellKnob />
        </RoomRuleBookBellShape>
        <RoomRuleBookBellLabel>{t('book.lastCard.bell')}</RoomRuleBookBellLabel>
      </RoomRuleBookBell>
      <RoomRuleBookPair>
        <RoomRuleBookBox tone="good">
          <RoomRuleBookBoxTitle tone="good">
            <CheckIcon />
            {t('book.lastCard.block')}
          </RoomRuleBookBoxTitle>
          <RoomRuleBookText>{t('book.lastCard.blockText')}</RoomRuleBookText>
        </RoomRuleBookBox>
        <RoomRuleBookBox tone="bad">
          <RoomRuleBookBoxTitle tone="bad">
            <CloseIcon />
            {t('book.lastCard.cost')}
          </RoomRuleBookBoxTitle>
          <RoomRuleBookText>{t('book.lastCard.costText')}</RoomRuleBookText>
        </RoomRuleBookBox>
      </RoomRuleBookPair>
      <RoomRuleBookText>{t('book.lastCard.many')}</RoomRuleBookText>
      <RoomRuleBookText tone="muted">{t('book.lastCard.turn')}</RoomRuleBookText>
    </>
  );
});
