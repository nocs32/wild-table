import { isWild, type CardFace } from '@wild-table/protocol';
import { drawBack } from './back';
import { drawActionFace, drawNumberFace, drawWildFace } from './faces';
import { cardHeight, cardWidth } from './frame';

export { cardHeight, cardWidth } from './frame';

const canvasFor = (scale: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
  const canvas = document.createElement('canvas');

  canvas.width = Math.round(cardWidth * scale);
  canvas.height = Math.round(cardHeight * scale);

  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No 2D canvas');

  ctx.scale(scale, scale);

  return { canvas, ctx };
};

// One card face on its own canvas, `scale` times the 250 × 350 design.
export const drawCardFace = (face: CardFace, scale: number): HTMLCanvasElement => {
  const { canvas, ctx } = canvasFor(scale);

  if (isWild(face)) drawWildFace(ctx, face);
  else if (face.kind === 'number') drawNumberFace(ctx, face);
  else drawActionFace(ctx, face);

  return canvas;
};

export const drawCardBack = (scale: number): HTMLCanvasElement => {
  const { canvas, ctx } = canvasFor(scale);

  drawBack(ctx);

  return canvas;
};
