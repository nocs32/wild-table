import { paint, suitPaint } from '../palette';
import type { FigureHat } from './types';

interface Head {
  x: number;
  y: number;
  radius: number;
}

// 'cut': the cardboard round the hat, cream and thick; 'ink': the hat itself, coloured and outlined.
export type HatPass = 'cut' | 'ink';

// Fills and outlines whatever `draw` traces, for the pass at hand.
const shape = (ctx: CanvasRenderingContext2D, pass: HatPass, colour: string, draw: () => void): void => {
  ctx.beginPath();
  draw();
  ctx.fillStyle = pass === 'cut' ? paint.card : colour;
  ctx.strokeStyle = pass === 'cut' ? paint.card : paint.ink;
  ctx.lineWidth = pass === 'cut' ? 24 : 5;
  ctx.fill();
  ctx.stroke();
};

const dome = (ctx: CanvasRenderingContext2D, { x, y, radius }: Head, lift: number): void => {
  ctx.arc(x, y - lift, radius + 3, Math.PI, Math.PI * 2);
  ctx.closePath();
};

// A cap worn sideways, brim out to the left.
const cap = (ctx: CanvasRenderingContext2D, pass: HatPass, colour: string, head: Head): void => {
  shape(ctx, pass, colour, () => dome(ctx, head, 20));
  shape(ctx, pass, colour, () => ctx.ellipse(head.x - head.radius - 12, head.y - 21, 28, 7, -0.08, 0, Math.PI * 2));
  shape(ctx, pass, colour, () => ctx.arc(head.x, head.y - head.radius - 23, 4, 0, Math.PI * 2));
};

const bucket = (ctx: CanvasRenderingContext2D, pass: HatPass, colour: string, { x, y, radius }: Head): void => {
  shape(ctx, pass, colour, () => {
    ctx.moveTo(x - 36, y - 28);
    ctx.lineTo(x - 26, y - 70);
    ctx.quadraticCurveTo(x, y - 80, x + 26, y - 70);
    ctx.lineTo(x + 36, y - 28);
    ctx.closePath();
  });

  shape(ctx, pass, colour, () => ctx.ellipse(x, y - 28, radius + 18, 10, 0, 0, Math.PI * 2));
};

// A beanie with a bobble; a bot's has a propeller instead.
const beanie = (ctx: CanvasRenderingContext2D, pass: HatPass, colour: string, head: Head, propeller: boolean): void => {
  shape(ctx, pass, colour, () => dome(ctx, head, 25));
  shape(ctx, pass, colour, () => ctx.roundRect(head.x - head.radius - 4, head.y - 33, head.radius * 2 + 8, 14, 5));

  if (!propeller) {
    shape(ctx, pass, colour, () => ctx.arc(head.x, head.y - head.radius - 31, 9, 0, Math.PI * 2));

    return;
  }

  const top = head.y - head.radius - 27;

  shape(ctx, pass, paint.ink, () => ctx.rect(head.x - 2, top - 10, 4, 10));
  shape(ctx, pass, suitPaint.red.main, () => ctx.ellipse(head.x - 15, top - 12, 14, 5, 0.15, 0, Math.PI * 2));
  shape(ctx, pass, suitPaint.yellow.main, () => ctx.ellipse(head.x + 15, top - 12, 14, 5, -0.15, 0, Math.PI * 2));
};

const bandana = (ctx: CanvasRenderingContext2D, pass: HatPass, colour: string, { x, y, radius }: Head): void => {
  shape(ctx, pass, colour, () => ctx.roundRect(x - radius - 1, y - 38, radius * 2 + 2, 14, 6));

  shape(ctx, pass, colour, () => {
    ctx.moveTo(x + radius - 2, y - 32);
    ctx.lineTo(x + radius + 20, y - 46);
    ctx.lineTo(x + radius + 22, y - 22);
    ctx.closePath();
  });
};

const visor = (ctx: CanvasRenderingContext2D, pass: HatPass, colour: string, { x, y, radius }: Head): void => {
  shape(ctx, pass, colour, () => ctx.roundRect(x - radius - 1, y - 38, radius * 2 + 2, 9, 4));
  shape(ctx, pass, colour, () => ctx.ellipse(x, y - 30, radius + 4, 10, 0, 0, Math.PI));
};

const headphones = (ctx: CanvasRenderingContext2D, pass: HatPass, colour: string, { x, y, radius }: Head): void => {
  ctx.beginPath();
  ctx.arc(x, y - 2, radius + 9, Math.PI * 1.08, Math.PI * 1.92);
  ctx.strokeStyle = pass === 'cut' ? paint.card : paint.ink;
  ctx.lineWidth = pass === 'cut' ? 30 : 9;
  ctx.stroke();
  [-1, 1].forEach((side) => shape(ctx, pass, colour, () => ctx.roundRect(x + side * (radius + 3) - 9, y - 16, 18, 32, 7)));
};

// The figure's hat, for one pass of the drawing.
export const drawHat = (ctx: CanvasRenderingContext2D, hat: FigureHat, colour: string, head: Head, pass: HatPass): void => {
  switch (hat) {
    case 'cap':
      return cap(ctx, pass, colour, head);
    case 'bucket':
      return bucket(ctx, pass, colour, head);
    case 'beanie':
    case 'propeller':
      return beanie(ctx, pass, colour, head, hat === 'propeller');
    case 'bandana':
      return bandana(ctx, pass, colour, head);
    case 'visor':
      return visor(ctx, pass, colour, head);
    case 'headphones':
      return headphones(ctx, pass, colour, head);
  }
};

// Hats that leave the top of the head bare show a few hairs.
export const showsHair = (hat: FigureHat): boolean => hat === 'bandana' || hat === 'visor' || hat === 'headphones';
