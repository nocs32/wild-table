import type { ActionFace, NumberFace, WildFace } from '@wild-table/protocol';
import { paint, suitPaint } from '../palette';
import { actionShapes, drawChunkyShapes, drawSparkle } from './icons';
import { cardHeight, cardWidth, drawCardStock, drawChunkyText, drawCorners, drawPanel } from './frame';
import { drawSymbol } from './symbols';

const centreX = cardWidth / 2;
const centreY = cardHeight / 2;
// The middle of each card leans a little, for energy.
const lean = -0.12;

const leaning = (ctx: CanvasRenderingContext2D, draw: () => void): void => {
  ctx.save();
  ctx.translate(centreX, centreY);
  ctx.rotate(lean);
  ctx.translate(-centreX, -centreY);
  draw();
  ctx.restore();
};

// The colour's symbol, huge and faint, behind the middle.
const drawWatermark = (ctx: CanvasRenderingContext2D, face: NumberFace | ActionFace): void => {
  ctx.save();
  ctx.globalAlpha = 0.2;
  drawSymbol(ctx, face.colour, centreX, centreY, 190, paint.card, 'transparent');
  ctx.restore();
};

// A number, or an action's symbol: its corner mark, with the colour's symbol under it.
const drawColourCorner = (ctx: CanvasRenderingContext2D, face: NumberFace | ActionFace, mark: () => void): void =>
  drawCorners(ctx, () => {
    mark();
    drawSymbol(ctx, face.colour, 34, 86, 26, paint.card, paint.ink);
  });

export const drawNumberFace = (ctx: CanvasRenderingContext2D, face: NumberFace): void => {
  const { main, deep } = suitPaint[face.colour];
  const text = String(face.value);

  drawCardStock(ctx);
  drawPanel(ctx, main, deep);
  drawWatermark(ctx, face);
  // 6 and 9 are underlined, so upside down they can't be mistaken.
  const mark = face.value === 6 || face.value === 9 ? `${text}.` : text;

  leaning(ctx, () => drawChunkyText(ctx, { text: mark, x: centreX, y: centreY, size: 168, shadow: deep }));
  drawColourCorner(ctx, face, () => drawChunkyText(ctx, { text: mark, x: 34, y: 46, size: 44, shadow: deep }));
};

const drawActionMark = (ctx: CanvasRenderingContext2D, face: ActionFace, x: number, y: number, size: number): void => {
  const { deep } = suitPaint[face.colour];

  if (face.kind === 'draw2') {
    drawChunkyText(ctx, { text: '+2', x, y, size: size * 0.92, shadow: deep });

    return;
  }

  drawChunkyShapes(ctx, actionShapes[face.kind](), x, y, size, deep);
};

export const drawActionFace = (ctx: CanvasRenderingContext2D, face: ActionFace): void => {
  const { main, deep } = suitPaint[face.colour];

  drawCardStock(ctx);
  drawPanel(ctx, main, deep);
  drawWatermark(ctx, face);
  leaning(ctx, () => drawActionMark(ctx, face, centreX, centreY, 150));
  drawColourCorner(ctx, face, () => drawActionMark(ctx, face, 34, 46, 42));
};

// Wild and Wild +4: a black card with the four-colour sparkle; the +4 says so on top of it.
export const drawWildFace = (ctx: CanvasRenderingContext2D, face: WildFace): void => {
  const isFour = face.kind === 'wild4';

  drawCardStock(ctx);
  drawPanel(ctx, paint.wild, 'rgba(255, 255, 255, 0.08)');

  leaning(ctx, () => {
    drawSparkle(ctx, centreX, centreY, isFour ? 176 : 200, 9, true);

    if (isFour) drawChunkyText(ctx, { text: '+4', x: centreX, y: centreY + 6, size: 104, shadow: paint.wild });
  });

  drawCorners(ctx, () => (isFour ? drawChunkyText(ctx, { text: '+4', x: 36, y: 46, size: 40, shadow: paint.wild }) : drawSparkle(ctx, 34, 46, 44, 7)));
};
