import type { ReactElement } from 'react';
import type { HowToView } from '../../../../../stores/rule-book/pages';
import { RoomRuleBookText } from '../../styled-components';
import { RoomRuleBookPageHowToScene } from './scene';
import { RoomRuleBookPageHowToDemoRoot, RoomRuleBookPageHowToTitle } from './styled-components';

interface RoomRuleBookPageHowToDemoProps {
  view: HowToView;
}

// One way to play a card: the little table, its name and how it's done.
export function RoomRuleBookPageHowToDemo({ view }: RoomRuleBookPageHowToDemoProps): ReactElement {
  return (
    <RoomRuleBookPageHowToDemoRoot>
      <RoomRuleBookPageHowToScene kind={view.kind} />
      <RoomRuleBookPageHowToTitle>{view.title}</RoomRuleBookPageHowToTitle>
      <RoomRuleBookText>{view.text}</RoomRuleBookText>
    </RoomRuleBookPageHowToDemoRoot>
  );
}
