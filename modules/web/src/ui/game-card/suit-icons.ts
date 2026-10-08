import type { CardColour } from '@wild-table/protocol';
import type { FunctionComponent, SVGProps } from 'react';
import { BlueSuitIcon, GreenSuitIcon, RedSuitIcon, YellowSuitIcon } from '../../assets';

// Each card colour's symbol (spec D22), by colour.
export const suitIcons: Record<CardColour, FunctionComponent<SVGProps<SVGSVGElement>>> = {
  red: RedSuitIcon,
  yellow: YellowSuitIcon,
  green: GreenSuitIcon,
  blue: BlueSuitIcon,
};
