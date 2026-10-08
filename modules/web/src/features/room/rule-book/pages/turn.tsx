import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRuleBookExample, RoomRuleBookTry } from '../parts';
import { RoomRuleBookLead, RoomRuleBookText } from '../styled-components';

// Page 2, your turn: what fits on the pile and why, then a hand to try it with.
export const RoomRuleBookPageTurn = observer(function RoomRuleBookPageTurn(): ReactElement {
  const { locale, ruleBook } = useRootStore();

  return (
    <>
      <RoomRuleBookLead>{locale.t('book.turn.lead')}</RoomRuleBookLead>
      <RoomRuleBookExample example={ruleBook.turn} />
      <RoomRuleBookTry store={ruleBook.turnTry} />
      <RoomRuleBookText tone="note">{locale.t('book.turn.draw')}</RoomRuleBookText>
    </>
  );
});
