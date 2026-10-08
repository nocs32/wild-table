import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRuleBookCard } from '../parts';
import { RoomRuleBookRow } from '../parts/styled-components';
import { RoomRuleBookLead, RoomRuleBookText } from '../styled-components';
import { RoomRuleBookList, RoomRuleBookPoints, RoomRuleBookScoreName, RoomRuleBookScoreRow, RoomRuleBookSum, RoomRuleBookTotal } from './styled-components';

// Page 6, scoring (spec §5.9): what each card is worth, and a finished round's leftover hands added
// up, by the game's own scoring.
export const RoomRuleBookPageScoring = observer(function RoomRuleBookPageScoring(): ReactElement {
  const { locale, ruleBook } = useRootStore();
  const { t } = locale;
  const { scoring } = ruleBook;

  return (
    <>
      <RoomRuleBookLead>{t('book.scoring.lead')}</RoomRuleBookLead>
      <RoomRuleBookText>{t('book.scoring.values')}</RoomRuleBookText>
      <RoomRuleBookText>{t('book.scoring.example')}</RoomRuleBookText>
      <RoomRuleBookList>
        {scoring.hands.map((hand) => (
          <RoomRuleBookScoreRow key={hand.name}>
            <RoomRuleBookScoreName>{hand.name}</RoomRuleBookScoreName>
            <RoomRuleBookRow>
              {hand.cards.map((card) => (
                <RoomRuleBookPoints key={card.key}>
                  <RoomRuleBookCard card={card} size="sm" />
                  {card.points}
                </RoomRuleBookPoints>
              ))}
            </RoomRuleBookRow>
            <RoomRuleBookTotal>{t('book.scoring.points', { count: hand.total })}</RoomRuleBookTotal>
          </RoomRuleBookScoreRow>
        ))}
      </RoomRuleBookList>
      <RoomRuleBookSum>{t('book.scoring.total', { count: scoring.total })}</RoomRuleBookSum>
      <RoomRuleBookText tone="note">{t('book.scoring.drawFirst')}</RoomRuleBookText>
      <RoomRuleBookText>{t('book.scoring.target', { count: ruleBook.targetScore })}</RoomRuleBookText>
    </>
  );
});
