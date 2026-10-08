import type { CardColour } from '@wild-table/protocol';
import { token } from 'styled-system/tokens';

// The art's colours come from the design system, so the cards, the table and the HTML all match.

export interface SuitPaint {
  main: string;
  deep: string;
}

export const suitPaint: Record<CardColour, SuitPaint> = {
  red: { main: token('colors.suit.red'), deep: token('colors.suit.redDeep') },
  yellow: { main: token('colors.suit.yellow'), deep: token('colors.suit.yellowDeep') },
  green: { main: token('colors.suit.green'), deep: token('colors.suit.greenDeep') },
  blue: { main: token('colors.suit.blue'), deep: token('colors.suit.blueDeep') },
};

export const paint = {
  ink: token('colors.print.ink'),
  card: token('colors.print.card'),
  paper: token('colors.print.paper'),
  shade: token('colors.print.shade'),
  muted: token('colors.print.muted'),
  wild: token('colors.suit.wild'),
  brass: token('colors.brass.base'),
  brassLight: token('colors.brass.light'),
  feltLight: token('colors.felt.light'),
  feltBase: token('colors.felt.base'),
  feltEdge: token('colors.felt.edge'),
  woodDeep: token('colors.wood.deep'),
  woodDark: token('colors.wood.dark'),
  woodBase: token('colors.wood.base'),
  woodLight: token('colors.wood.light'),
  woodGrain: token('colors.wood.grain'),
  lamp: token('colors.lamp.glow'),
  neonPink: token('colors.neon.pink'),
  neonPinkDeep: token('colors.neon.pinkDeep'),
  neonCyan: token('colors.neon.cyan'),
};

// Canvas text uses the same typeface as the page.
export const artFont = token('fonts.display');
