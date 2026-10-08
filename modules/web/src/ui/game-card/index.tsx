import type { CardColour } from '@wild-table/protocol';
import type { ReactElement, ReactNode } from 'react';
import { GameCardHead } from './head';
import { GameCardBody, GameCardRoot } from './styled-components';

interface GameCardProps {
  // The card colour of its header, and the symbol that goes with it.
  suit: CardColour;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// A big card in the game's own style, for the lobby's panels: cream card stock with an ink edge, and
// a printed header in one of the four colours with that colour's symbol, lettered like the cards.
export function GameCard({ suit, title, subtitle, children }: GameCardProps): ReactElement {
  return (
    <GameCardRoot suit={suit} aria-label={title}>
      <GameCardHead suit={suit} title={title} subtitle={subtitle} />
      <GameCardBody>{children}</GameCardBody>
    </GameCardRoot>
  );
}
