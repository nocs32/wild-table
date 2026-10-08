import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ruleBookShots } from '../../../../../assets';
import { useRootStore } from '../../../../../stores/use-root-store';
import { RoomRuleBookShot } from '../../parts';
import { RoomRuleBookLead, RoomRuleBookText } from '../../styled-components';
import { RoomRuleBookPageHowToDemo } from './demo';
import { RoomRuleBookPageHowToGrid } from './styled-components';

// Page 8, how to play a card (spec §8.2, §9.1): drag, throw, click twice and draw, each shown on a
// little looping table, in the words for a mouse or for a finger.
export const RoomRuleBookPageHowTo = observer(function RoomRuleBookPageHowTo(): ReactElement {
  const { locale, ruleBook } = useRootStore();

  return (
    <>
      <RoomRuleBookLead>{locale.t('book.howTo.lead')}</RoomRuleBookLead>
      <RoomRuleBookShot src={ruleBookShots.heldCard} caption={locale.t('book.shots.heldCard')} />
      <RoomRuleBookPageHowToGrid>
        {ruleBook.howTo.map((view) => (
          <RoomRuleBookPageHowToDemo key={view.kind} view={view} />
        ))}
      </RoomRuleBookPageHowToGrid>
      <RoomRuleBookText tone="note">{locale.t('book.howTo.glow')}</RoomRuleBookText>
    </>
  );
});
