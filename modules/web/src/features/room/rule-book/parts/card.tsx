import type { ReactElement } from 'react';
import type { CardView } from '../../../../stores/rule-book/cards';
import { RoomRuleBookCardImage, RoomRuleBookCardRoot } from './styled-components';

interface RoomRuleBookCardProps {
  card: CardView;
  size?: 'sm' | 'md' | 'lg';
  shake?: boolean;
  // A ✅ or ❌ on its corner.
  children?: ReactElement | false;
}

// A real card from the game's own art, named for screen readers ("Red 7"). A blank stands in until
// the art is drawn.
export function RoomRuleBookCard({ card, size = 'md', shake = false, children }: RoomRuleBookCardProps): ReactElement {
  return (
    <RoomRuleBookCardRoot size={size} shake={shake} title={card.label}>
      {card.url ? <RoomRuleBookCardImage src={card.url} alt={card.label} draggable={false} /> : <RoomRuleBookCardImage as="span" role="img" aria-label={card.label} />}
      {children}
    </RoomRuleBookCardRoot>
  );
}
