import { paint } from '../palette';
import type { FigureDrawing, FigureMood } from './types';

interface Spot {
  x: number;
  y: number;
}

const eyeGap = 16;

const line = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

// Dot eyes looking where the figure looks; squeezed shut with joy when cheering, wide when surprised.
const drawEyes = (ctx: CanvasRenderingContext2D, mood: FigureMood, look: Spot, face: Spot): void => {
  [-1, 1].forEach((side) => {
    const x = face.x + side * eyeGap;
    const y = face.y - 4;

    if (mood === 'cheer') {
      ctx.beginPath();
      ctx.arc(x, y + 3, 7, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      return;
    }

    const size = mood === 'surprised' ? 1.35 : 1;

    ctx.beginPath();
    ctx.ellipse(x + look.x * 3, y - look.y * 3, 6 * size, 8 * size, 0, 0, Math.PI * 2);
    ctx.fill();
  });
};

// Eyebrows: how each mood sets them, as the rise at each brow's outer and inner end.
const brows: Record<FigureMood, readonly [number, number]> = {
  idle: [2, 2],
  thinking: [6, 2],
  happy: [3, 3],
  cheer: [7, 7],
  sad: [-1, 6],
  surprised: [9, 9],
  angry: [5, -3],
  smug: [6, -1],
  wave: [3, 3],
};

const drawBrows = (ctx: CanvasRenderingContext2D, mood: FigureMood, face: Spot): void => {
  const [outer, inner] = brows[mood];

  [-1, 1].forEach((side) => {
    const x = face.x + side * eyeGap;
    const y = face.y - 18;
    // The smug figure raises one brow only.
    const lift = mood === 'smug' && side === 1 ? -3 : 0;

    line(ctx, x + side * 8, y - outer - lift, x - side * 6, y - inner - lift);
  });
};

const drawMouth = (ctx: CanvasRenderingContext2D, mood: FigureMood, face: Spot): void => {
  const x = face.x;
  const y = face.y + 20;

  ctx.beginPath();

  switch (mood) {
    case 'thinking':
      ctx.moveTo(x - 2, y + 2);
      ctx.lineTo(x + 14, y - 3);
      break;
    case 'happy':
    case 'wave':
      ctx.arc(x, y - 8, 12, Math.PI * 0.2, Math.PI * 0.8);
      break;
    case 'cheer':
      ctx.arc(x, y - 4, 13, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      break;
    case 'sad':
      ctx.arc(x, y + 10, 11, Math.PI * 1.2, Math.PI * 1.8);
      break;
    case 'surprised':
      ctx.ellipse(x, y + 2, 6, 8, 0, 0, Math.PI * 2);
      break;
    case 'angry':
      [-10, -5, 0, 5, 10].forEach((step, index) => (index === 0 ? ctx.moveTo(x + step, y) : ctx.lineTo(x + step, y + (index % 2 === 0 ? 0 : -4))));
      break;
    case 'smug':
      ctx.moveTo(x - 10, y + 1);
      ctx.quadraticCurveTo(x + 2, y + 5, x + 12, y - 6);
      break;
    default:
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x + 8, y);
  }

  ctx.stroke();
};

// The face, turned a little towards where the figure looks, in ink.
export const drawFace = (ctx: CanvasRenderingContext2D, { mood, look }: Pick<FigureDrawing, 'mood' | 'look'>, centre: Spot): void => {
  const face = { x: centre.x + look.x * 8, y: centre.y - look.y * 4 };

  ctx.fillStyle = paint.ink;
  ctx.lineWidth = 5;
  drawEyes(ctx, mood, look, face);
  drawBrows(ctx, mood, face);
  drawMouth(ctx, mood, face);
};
