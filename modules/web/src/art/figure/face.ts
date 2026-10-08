import { paint, suitPaint } from '../palette';
import type { FigureDrawing, FigureMood } from './types';

interface Spot {
  x: number;
  y: number;
}

const eyeGap = 16;
// Where a figure looks on its turn: down at the cards it holds up.
const focus = { x: 0.6, y: -0.9 };

// The moods whose eyes aren't plain dots on whoever's turn it is: wide when surprised, and on its
// turn on the cards (narrowed concentrating, wide and worried when nervous), or up and away while it
// thinks.
const eyes: Partial<Record<FigureMood, { look?: { x: number; y: number }; width: number; height: number }>> = {
  surprised: { width: 8, height: 11 },
  concentrate: { look: focus, width: 6, height: 6 },
  confident: { look: focus, width: 6, height: 8 },
  nervous: { look: focus, width: 7.5, height: 10.5 },
  thinking: { look: { x: -0.8, y: 0.9 }, width: 6, height: 8 },
};

const line = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

// Dot eyes looking where the figure looks, low on the face so no hat hides them: squeezed shut with
// joy when cheering, wide when surprised, screwed up when frustrated, a line for a blink.
const drawEye = (ctx: CanvasRenderingContext2D, { mood, look, blink }: Pick<FigureDrawing, 'mood' | 'look' | 'blink'>, x: number, y: number, side: number): void => {
  ctx.beginPath();

  if (mood === 'cheer' || mood === 'dance') {
    ctx.arc(x, y + 3, 7, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else if (mood === 'frustrated') {
    ctx.moveTo(x - side * 6, y - 6);
    ctx.lineTo(x + side * 5, y);
    ctx.lineTo(x - side * 6, y + 6);
    ctx.stroke();
  } else if (blink || ((mood === 'taunt' || mood === 'wink') && side === 1)) {
    ctx.moveTo(x - 7, y + 1);
    ctx.quadraticCurveTo(x, y + 4, x + 7, y + 1);
    ctx.stroke();
  } else {
    const eye = eyes[mood];
    const gaze = eye?.look ?? look;

    ctx.ellipse(x + gaze.x * 3, y - gaze.y * 3, eye?.width ?? 6, eye?.height ?? 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawEyes = (ctx: CanvasRenderingContext2D, figure: Pick<FigureDrawing, 'mood' | 'look' | 'blink'>, face: Spot): void => {
  [-1, 1].forEach((side) => drawEye(ctx, figure, face.x + side * eyeGap, face.y + 4, side));
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
  clap: [4, 4],
  frustrated: [4, -3],
  taunt: [7, 3],
  concentrate: [2, -3],
  confident: [5, 4],
  nervous: [-2, 8],
  wink: [5, 2],
  lounge: [3, 3],
  pinball: [3, -3],
  dance: [6, 6],
  soda: [3, 3],
  pizza: [4, 4],
};

const drawBrows = (ctx: CanvasRenderingContext2D, mood: FigureMood, face: Spot): void => {
  const [outer, inner] = brows[mood];

  [-1, 1].forEach((side) => {
    const x = face.x + side * eyeGap;
    const y = face.y - 8;
    // The smug figure raises one brow only.
    const lift = mood === 'smug' && side === 1 ? -3 : 0;

    line(ctx, x + side * 8, y - outer - lift, x - side * 6, y - inner - lift);
  });
};

// A big open grin, filled in.
const fillGrin = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void => {
  ctx.arc(x, y - 4, radius, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
};

// Blowing a raspberry: a wide mouth with the tongue stuck out over the lip.
const drawTongue = (ctx: CanvasRenderingContext2D, x: number, y: number): void => {
  ctx.moveTo(x - 13, y - 3);
  ctx.quadraticCurveTo(x, y + 3, x + 13, y - 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 7, y);
  ctx.lineTo(x - 7, y + 8);
  ctx.arc(x, y + 8, 7, Math.PI, 0, true);
  ctx.lineTo(x + 7, y);
  ctx.fillStyle = suitPaint.red.main;
  ctx.fill();
  ctx.fillStyle = paint.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + 3);
  ctx.lineTo(x, y + 9);
};

// The tip of the tongue poking out of the corner of the mouth, trying hard.
const poke = (ctx: CanvasRenderingContext2D, x: number, y: number): void => {
  ctx.ellipse(x, y, 5, 6, 0.6, 0, Math.PI * 2);
  ctx.fillStyle = suitPaint.red.main;
  ctx.fill();
  ctx.fillStyle = paint.ink;
  ctx.stroke();
  ctx.beginPath();
};

// A bead of sweat by the temple: what now?
const drawSweat = (ctx: CanvasRenderingContext2D, face: Spot): void => {
  const x = face.x - 42;
  const y = face.y - 12;

  ctx.beginPath();
  ctx.moveTo(x, y - 11);
  ctx.quadraticCurveTo(x + 8, y + 2, x, y + 6);
  ctx.quadraticCurveTo(x - 8, y + 2, x, y - 11);
  ctx.fillStyle = suitPaint.blue.main;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = paint.ink;
};

// Teeth gritted: a box of a mouth with the teeth drawn in.
const traceGrimace = (ctx: CanvasRenderingContext2D, x: number, y: number): void => {
  ctx.roundRect(x - 13, y - 6, 26, 11, 4);

  [-4, 4].forEach((step) => {
    ctx.moveTo(x + step, y - 6);
    ctx.lineTo(x + step, y + 5);
  });
};

type Mouth = (ctx: CanvasRenderingContext2D, x: number, y: number) => void;

const smile: Mouth = (ctx, x, y) => ctx.arc(x, y - 8, 12, Math.PI * 0.2, Math.PI * 0.8);

// Each mood's mouth, traced (or drawn) with its middle at (x, y); a flat line for the rest.
const mouths: Partial<Record<FigureMood, Mouth>> = {
  thinking: (ctx, x, y) => {
    ctx.moveTo(x - 2, y + 2);
    ctx.lineTo(x + 14, y - 3);
  },
  happy: smile,
  wave: smile,
  wink: smile,
  lounge: smile,
  soda: smile,
  pizza: (ctx, x, y) => fillGrin(ctx, x, y, 8),
  dance: (ctx, x, y) => fillGrin(ctx, x, y, 11),
  pinball: (ctx, x, y) => {
    poke(ctx, x + 10, y + 2);
    ctx.moveTo(x - 8, y - 2);
    ctx.lineTo(x + 9, y);
  },
  cheer: (ctx, x, y) => fillGrin(ctx, x, y, 13),
  clap: (ctx, x, y) => fillGrin(ctx, x, y, 10),
  frustrated: traceGrimace,
  taunt: drawTongue,
  concentrate: (ctx, x, y) => {
    poke(ctx, x - 10, y + 2);
    ctx.moveTo(x - 9, y);
    ctx.lineTo(x + 8, y - 2);
  },
  confident: (ctx, x, y) => ctx.arc(x, y - 10, 14, Math.PI * 0.15, Math.PI * 0.85),
  nervous: (ctx, x, y) => {
    ctx.moveTo(x - 12, y);
    ctx.bezierCurveTo(x - 7, y - 5, x - 3, y + 5, x + 1, y);
    ctx.bezierCurveTo(x + 5, y - 5, x + 9, y + 4, x + 12, y);
  },
  sad: (ctx, x, y) => ctx.arc(x, y + 10, 11, Math.PI * 1.2, Math.PI * 1.8),
  surprised: (ctx, x, y) => ctx.ellipse(x, y + 2, 6, 8, 0, 0, Math.PI * 2),
  angry: (ctx, x, y) => [-10, -5, 0, 5, 10].forEach((step, index) => (index === 0 ? ctx.moveTo(x + step, y) : ctx.lineTo(x + step, y + (index % 2 === 0 ? 0 : -4)))),
  smug: (ctx, x, y) => {
    ctx.moveTo(x - 10, y + 1);
    ctx.quadraticCurveTo(x + 2, y + 5, x + 12, y - 6);
  },
};

const flat: Mouth = (ctx, x, y) => {
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + 8, y);
};

const drawMouth = (ctx: CanvasRenderingContext2D, mood: FigureMood, face: Spot): void => {
  ctx.beginPath();
  (mouths[mood] ?? flat)(ctx, face.x, face.y + 26);
  ctx.stroke();
};

// The face, turned a little towards where the figure looks, in ink.
export const drawFace = (ctx: CanvasRenderingContext2D, figure: Pick<FigureDrawing, 'mood' | 'look' | 'blink'>, centre: Spot): void => {
  const { mood, look } = figure;
  const face = { x: centre.x + look.x * 8, y: centre.y - look.y * 4 };

  ctx.fillStyle = paint.ink;
  ctx.lineWidth = 5;
  drawEyes(ctx, figure, face);
  drawBrows(ctx, mood, face);
  drawMouth(ctx, mood, face);

  if (mood === 'nervous') drawSweat(ctx, face);
};
