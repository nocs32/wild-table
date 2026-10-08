import { cardColours, type CardColour } from '@wild-table/protocol';
import { token } from 'styled-system/tokens';
import { Color } from 'three';
import { paint, suitPaint } from '../../../art/palette';

// Colours brighter than white, for things that glow: the bloom only picks those up (spec §10.2).
const glowing = (colour: string, strength: number): Color => new Color(colour).multiplyScalar(strength);

export const glow = {
  pink: glowing(paint.neonPink, 3.4),
  cyan: glowing(paint.neonCyan, 3),
  amber: glowing(paint.lamp, 2.6),
  sign: new Color(1, 1, 1).multiplyScalar(2.2),
  card: glowing(paint.card, 1.6),
  lava: glowing(paint.neonPink, 2.2),
  blob: glowing(paint.lamp, 2.4),
  bulb: glowing(paint.lamp, 4),
};

// The four card colours, glowing: the colour in play under the pile, a Wild's wave (spec §8.1).
export const suitGlow = Object.fromEntries(cardColours.map((colour) => [colour, glowing(suitPaint[colour].main, 1.8)])) as Record<CardColour, Color>;

// The furniture's own colours.
export const furniture = {
  rail: new Color(token('colors.leather.base')),
  wood: new Color(paint.woodDark),
  floor: new Color(token('colors.room.dusk')),
  cardEdge: new Color(paint.card),
  brass: new Color(paint.brass),
  ink: new Color(paint.ink),
  cardboard: new Color(paint.woodGrain).multiplyScalar(0.9),
  velour: new Color(suitPaint.yellow.deep).multiplyScalar(0.55),
  velourDeep: new Color(suitPaint.yellow.deep).multiplyScalar(0.4),
  cheese: new Color(suitPaint.yellow.main),
  sauce: new Color(suitPaint.red.deep),
  canRed: new Color(suitPaint.red.main),
  canBlue: new Color(suitPaint.blue.main),
};
