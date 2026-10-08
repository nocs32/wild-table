import { paint, suitPaint } from '../palette';
import type { FigureMood, Point } from './types';

type ItemPass = 'cut' | 'ink';

// The outline of what's held, just above the hand.
const trace = (ctx: CanvasRenderingContext2D, mood: FigureMood, [x, y]: Point): void => {
  ctx.beginPath();

  if (mood === 'soda') {
    ctx.roundRect(x - 10, y - 30, 20, 32, 5);

    return;
  }

  ctx.moveTo(x - 6, y - 32);
  ctx.quadraticCurveTo(x + 8, y - 38, x + 20, y - 28);
  ctx.lineTo(x + 2, y + 4);
  ctx.closePath();
};

// A soda can's white band, or the pizza's pepperoni.
const drawDetail = (ctx: CanvasRenderingContext2D, mood: FigureMood, [x, y]: Point): void => {
  if (mood === 'soda') {
    ctx.fillStyle = paint.card;
    ctx.fillRect(x - 8, y - 18, 16, 6);

    return;
  }

  ctx.fillStyle = suitPaint.red.main;

  [
    [x + 4, y - 22],
    [x + 9, y - 12],
  ].forEach(([px = 0, py = 0]) => {
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });
};

// What a figure holds in its right hand in the lobby, a can of soda or a slice of pizza: thick in
// cream for the cardboard, then coloured and outlined in ink.
export const drawItem = (ctx: CanvasRenderingContext2D, mood: FigureMood, hand: Point | undefined, pass: ItemPass): void => {
  if (!hand || (mood !== 'soda' && mood !== 'pizza')) return;

  trace(ctx, mood, hand);

  if (pass === 'cut') {
    ctx.fillStyle = paint.card;
    ctx.strokeStyle = paint.card;
    ctx.lineWidth = 16;
    ctx.fill();
    ctx.stroke();

    return;
  }

  ctx.fillStyle = mood === 'soda' ? suitPaint.red.main : suitPaint.yellow.main;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = paint.ink;
  ctx.stroke();
  drawDetail(ctx, mood, hand);
  ctx.lineWidth = 6;
};
