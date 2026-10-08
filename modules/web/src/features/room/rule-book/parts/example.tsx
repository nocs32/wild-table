import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { MarkedExample } from '../../../../stores/rule-book/pages';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRuleBookCard } from './card';
import { RoomRuleBookMarked } from './marked';
import { RoomRuleBookExampleRoot, RoomRuleBookGroup, RoomRuleBookGroupLabel, RoomRuleBookPile, RoomRuleBookRow } from './styled-components';

interface RoomRuleBookExampleProps {
  example: MarkedExample;
}

// The pile on its felt mat, and a hand with each card marked.
export const RoomRuleBookExample = observer(function RoomRuleBookExample({ example }: RoomRuleBookExampleProps): ReactElement {
  const { t } = useRootStore().locale;

  return (
    <RoomRuleBookExampleRoot>
      <RoomRuleBookGroup>
        <RoomRuleBookGroupLabel>{t('book.try.pile')}</RoomRuleBookGroupLabel>
        <RoomRuleBookPile>
          <RoomRuleBookCard card={example.top} />
        </RoomRuleBookPile>
      </RoomRuleBookGroup>
      <RoomRuleBookGroup>
        <RoomRuleBookGroupLabel>{t('book.try.hand')}</RoomRuleBookGroupLabel>
        <RoomRuleBookRow>
          {example.hand.map((card) => (
            <RoomRuleBookMarked key={card.key} card={card} />
          ))}
        </RoomRuleBookRow>
      </RoomRuleBookGroup>
    </RoomRuleBookExampleRoot>
  );
});
