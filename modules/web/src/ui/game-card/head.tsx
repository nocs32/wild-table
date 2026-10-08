import type { CardColour } from '@wild-table/protocol';
import type { ReactElement } from 'react';
import { GameCardHeadRoot, GameCardSubtitle, GameCardSymbol, GameCardTitle, GameCardTitles } from './styled-components';
import { suitIcons } from './suit-icons';

interface GameCardHeadProps {
  suit: CardColour;
  title: string;
  subtitle?: string;
}

// The printed header: the colour's symbol, the title in chunky lettering, and a line under it.
export function GameCardHead({ suit, title, subtitle }: GameCardHeadProps): ReactElement {
  const Symbol = suitIcons[suit];

  return (
    <GameCardHeadRoot>
      <GameCardSymbol>
        <Symbol />
      </GameCardSymbol>
      <GameCardTitles>
        <GameCardTitle>{title}</GameCardTitle>
        {subtitle && <GameCardSubtitle>{subtitle}</GameCardSubtitle>}
      </GameCardTitles>
    </GameCardHeadRoot>
  );
}
