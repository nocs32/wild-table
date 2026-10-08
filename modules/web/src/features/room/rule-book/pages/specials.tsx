import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRuleBookCard, RoomRuleBookTry } from '../parts';
import { RoomRuleBookLead, RoomRuleBookText } from '../styled-components';
import { RoomRuleBookList, RoomRuleBookSpecial, RoomRuleBookSpecialName, RoomRuleBookSpecialText } from './styled-components';

// Page 3, the special cards: one of each, what it does and to whom, then a hand of them to try.
export const RoomRuleBookPageSpecials = observer(function RoomRuleBookPageSpecials(): ReactElement {
  const { locale, ruleBook } = useRootStore();

  return (
    <>
      <RoomRuleBookLead>{locale.t('book.specials.lead')}</RoomRuleBookLead>
      <RoomRuleBookList>
        {ruleBook.specials.map((special) => (
          <RoomRuleBookSpecial key={special.card.key}>
            <RoomRuleBookCard card={special.card} />
            <RoomRuleBookSpecialText>
              <RoomRuleBookSpecialName>{special.name}</RoomRuleBookSpecialName>
              <RoomRuleBookText>{special.does}</RoomRuleBookText>
              <RoomRuleBookText tone="muted">{special.example}</RoomRuleBookText>
            </RoomRuleBookSpecialText>
          </RoomRuleBookSpecial>
        ))}
      </RoomRuleBookList>
      <RoomRuleBookText tone="note">{locale.t('book.specials.first')}</RoomRuleBookText>
      <RoomRuleBookTry store={ruleBook.specialsTry} />
    </>
  );
});
