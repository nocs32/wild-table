import { token } from 'styled-system/tokens';
import { Color } from 'three';
import { paint } from '../../../art/palette';

// Colours brighter than white, for things that glow: the bloom only picks those up (spec §10.2).
const glowing = (colour: string, strength: number): Color => new Color(colour).multiplyScalar(strength);

export const glow = {
  pink: glowing(paint.neonPink, 3.4),
  cyan: glowing(paint.neonCyan, 3),
  amber: glowing(paint.lamp, 2.6),
  sign: new Color(1, 1, 1).multiplyScalar(2.2),
};

// The furniture's own colours.
export const furniture = {
  rail: new Color(token('colors.leather.base')),
  wood: new Color(paint.woodDark),
  floor: new Color(token('colors.room.dusk')),
  cardEdge: new Color(paint.card),
};
