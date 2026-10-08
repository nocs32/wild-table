import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import {
  RoomRuleBookPageGoal,
  RoomRuleBookPageHouseRules,
  RoomRuleBookPageHowTo,
  RoomRuleBookPageLastCard,
  RoomRuleBookPageScoring,
  RoomRuleBookPageSpecials,
  RoomRuleBookPageTurn,
  RoomRuleBookPageWild4,
} from './pages';
import { RoomRuleBookSection } from './section';
import { RoomRuleBookScroll } from './styled-components';
import { useRoomRuleBookScroll } from './use-scroll';

// The whole leaflet, one section after another: scroll through it, or jump with the tabs.
export const RoomRuleBookPage = observer(function RoomRuleBookPage(): ReactElement {
  const { ruleBook } = useRootStore();
  const scrollRef = useRoomRuleBookScroll(ruleBook.jump, ruleBook.see);
  const [goal, turn, specials, wild4, lastCard, scoring, houseRules, howTo] = ruleBook.tabs;

  return (
    <RoomRuleBookScroll ref={scrollRef}>
      <RoomRuleBookSection tab={goal}>
        <RoomRuleBookPageGoal />
      </RoomRuleBookSection>
      <RoomRuleBookSection tab={turn}>
        <RoomRuleBookPageTurn />
      </RoomRuleBookSection>
      <RoomRuleBookSection tab={specials}>
        <RoomRuleBookPageSpecials />
      </RoomRuleBookSection>
      <RoomRuleBookSection tab={wild4}>
        <RoomRuleBookPageWild4 />
      </RoomRuleBookSection>
      <RoomRuleBookSection tab={lastCard}>
        <RoomRuleBookPageLastCard />
      </RoomRuleBookSection>
      <RoomRuleBookSection tab={scoring}>
        <RoomRuleBookPageScoring />
      </RoomRuleBookSection>
      <RoomRuleBookSection tab={houseRules}>
        <RoomRuleBookPageHouseRules />
      </RoomRuleBookSection>
      <RoomRuleBookSection tab={howTo}>
        <RoomRuleBookPageHowTo />
      </RoomRuleBookSection>
    </RoomRuleBookScroll>
  );
});
