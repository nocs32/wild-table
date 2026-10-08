import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { HowToKind } from '../../../../../stores/rule-book/pages';
import { useRootStore } from '../../../../../stores/use-root-store';
import { RoomRuleBookPageHowToMover, RoomRuleBookPageHowToPointer, RoomRuleBookPageHowToSceneRoot, RoomRuleBookPageHowToSlot } from './styled-components';

interface RoomRuleBookPageHowToSceneProps {
  kind: HowToKind;
}

// A patch of felt where a card goes from the hand to the pile (or from the deck to the hand), with
// a fingertip doing it.
export const RoomRuleBookPageHowToScene = observer(function RoomRuleBookPageHowToScene({ kind }: RoomRuleBookPageHowToSceneProps): ReactElement {
  const { pile, hand, back } = useRootStore().ruleBook.howToScene;
  const isDraw = kind === 'draw';
  const moving = isDraw ? back : hand[2]?.url;

  return (
    <RoomRuleBookPageHowToSceneRoot aria-hidden>
      <RoomRuleBookPageHowToSlot at="handA">{hand[0]?.url && <img src={hand[0].url} alt="" />}</RoomRuleBookPageHowToSlot>
      <RoomRuleBookPageHowToSlot at="handB">{hand[1]?.url && <img src={hand[1].url} alt="" />}</RoomRuleBookPageHowToSlot>
      <RoomRuleBookPageHowToSlot at="pile">{(isDraw ? back : pile.url) && <img src={(isDraw ? back : pile.url) ?? ''} alt="" />}</RoomRuleBookPageHowToSlot>
      <RoomRuleBookPageHowToMover kind={kind}>
        {moving && <img src={moving} alt="" />}
        <RoomRuleBookPageHowToPointer />
      </RoomRuleBookPageHowToMover>
    </RoomRuleBookPageHowToSceneRoot>
  );
});
