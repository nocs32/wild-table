import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { ruleBookShots } from '../../../../assets';
import { RoomRuleBookCard, RoomRuleBookShot } from '../parts';
import { RoomRuleBookLead, RoomRuleBookText } from '../styled-components';
import { RoomRuleBookStep, RoomRuleBookStepNumber, RoomRuleBookSteps } from './styled-components';
import { RoomRuleBookExampleRoot, RoomRuleBookGroup, RoomRuleBookRow } from '../parts/styled-components';

// Page 1, the goal: get rid of all your cards. The steps use this table's hand size and target.
export const RoomRuleBookPageGoal = observer(function RoomRuleBookPageGoal(): ReactElement {
  const { locale, ruleBook } = useRootStore();
  const { goal } = ruleBook;

  return (
    <>
      <RoomRuleBookLead>{locale.t('book.goal.lead')}</RoomRuleBookLead>
      <RoomRuleBookShot src={ruleBookShots.table} caption={locale.t('book.shots.table')} />
      <RoomRuleBookSteps>
        {goal.steps.map((step, index) => (
          <RoomRuleBookStep key={step}>
            <RoomRuleBookStepNumber>{index + 1}</RoomRuleBookStepNumber>
            <span>{step}</span>
          </RoomRuleBookStep>
        ))}
      </RoomRuleBookSteps>
      <RoomRuleBookExampleRoot>
        <RoomRuleBookGroup>
          <RoomRuleBookRow>
            {goal.hand.map((card) => (
              <RoomRuleBookCard key={card.key} card={card} />
            ))}
          </RoomRuleBookRow>
          <RoomRuleBookText tone="muted">{locale.t('book.goal.handNote')}</RoomRuleBookText>
        </RoomRuleBookGroup>
      </RoomRuleBookExampleRoot>
    </>
  );
});
