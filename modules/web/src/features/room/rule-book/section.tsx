import type { ReactElement, ReactNode } from 'react';
import type { RuleBookTab } from '../../../stores/rule-book';
import { RoomRuleBookHeading, RoomRuleBookHeadingNumber, RoomRuleBookSectionRoot } from './styled-components';

interface RoomRuleBookSectionProps {
  tab: RuleBookTab | undefined;
  children: ReactNode;
}

// One section of the leaflet, headed with its number and name. The scroll hook finds it by
// `data-section`.
export function RoomRuleBookSection({ tab, children }: RoomRuleBookSectionProps): ReactElement | null {
  if (!tab) return null;

  return (
    <RoomRuleBookSectionRoot data-section={tab.page} aria-labelledby={`rules-${tab.page}`}>
      <RoomRuleBookHeading id={`rules-${tab.page}`}>
        <RoomRuleBookHeadingNumber>{tab.number}</RoomRuleBookHeadingNumber>
        {tab.label}
      </RoomRuleBookHeading>
      {children}
    </RoomRuleBookSectionRoot>
  );
}
