import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { ruleBookShots } from '../../../../assets';
import { RoomRuleBookCard, RoomRuleBookShot } from '../parts';
import { RoomRuleBookRow } from '../parts/styled-components';
import { RoomRuleBookLead, RoomRuleBookText } from '../styled-components';
import { RoomRuleBookBadge, RoomRuleBookBoxTitle, RoomRuleBookRule, RoomRuleBookRuleHead } from './styled-components';

// Section 7, the house rules (spec §5.7): one example each, and the ones on at this table say so.
// Opened from a tent card or a (?), the book points at that rule.
export const RoomRuleBookPageHouseRules = observer(function RoomRuleBookPageHouseRules(): ReactElement {
  const { locale, ruleBook } = useRootStore();
  const { t } = locale;

  return (
    <>
      <RoomRuleBookLead>{t('book.houseRules.lead')}</RoomRuleBookLead>
      <RoomRuleBookShot src={ruleBookShots.houseRules[locale.language]} caption={t('book.shots.houseRules')} />
      {ruleBook.houseRules.map((entry) => (
        <RoomRuleBookRule key={entry.rule} data-rule={entry.rule} on={entry.on} highlighted={entry.rule === ruleBook.highlighted}>
          <RoomRuleBookRuleHead>
            <RoomRuleBookBoxTitle>{entry.name}</RoomRuleBookBoxTitle>
            {entry.on && (
              <RoomRuleBookBadge>
                <CheckIcon />
                {t('book.houseRules.on')}
              </RoomRuleBookBadge>
            )}
          </RoomRuleBookRuleHead>
          <RoomRuleBookRow>
            {entry.cards.map((card) => (
              <RoomRuleBookCard key={card.key} card={card} size="sm" />
            ))}
          </RoomRuleBookRow>
          <RoomRuleBookText>{entry.detail}</RoomRuleBookText>
        </RoomRuleBookRule>
      ))}
    </>
  );
});
