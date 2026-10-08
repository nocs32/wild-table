import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRuleBookTab, RoomRuleBookTabLabel, RoomRuleBookTabNumber, RoomRuleBookTabsRoot } from './styled-components';

// The leaflet's index tabs, one per page.
export const RoomRuleBookTabs = observer(function RoomRuleBookTabs(): ReactElement {
  const { locale, ruleBook } = useRootStore();

  return (
    <RoomRuleBookTabsRoot aria-label={locale.t('book.pagesLabel')}>
      {ruleBook.tabs.map((tab) => (
        <RoomRuleBookTab key={tab.page} type="button" aria-current={tab.isCurrent ? 'page' : undefined} title={tab.label} onClick={() => ruleBook.goTo(tab.page)}>
          <RoomRuleBookTabNumber>{tab.number}</RoomRuleBookTabNumber>
          <RoomRuleBookTabLabel>{tab.label}</RoomRuleBookTabLabel>
        </RoomRuleBookTab>
      ))}
    </RoomRuleBookTabsRoot>
  );
});
