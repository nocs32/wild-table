import { paint } from '../palette';
import { bodyLines, handsOf, head, headDrop } from './body';
import { drawFace } from './face';
import { drawHat, showsHair } from './hat';
import { drawItem } from './items';
import { figureSize, type FigureDrawing, type Line } from './types';

export { figureHats, figureMoods, figureSize, type FigureDrawing, type FigureHat, type FigureMood } from './types';

interface Spot {
  x: number;
  y: number;
}

const strokeLine = (ctx: CanvasRenderingContext2D, line: Line): void => {
  ctx.beginPath();
  line.forEach(([x, y], index) => (index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.stroke();
};

const circle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
};

// The cardboard: every stroke drawn thick in cream first, so the figure is a die-cut stand-up that
// reads against the dark room, with a soft shadow round its edge.
const cutOut = (ctx: CanvasRenderingContext2D, figure: FigureDrawing, centre: Spot): void => {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = paint.card;
  ctx.fillStyle = paint.card;
  ctx.lineWidth = 26;
  bodyLines(figure.mood, figure.swing ?? 0).forEach((line) => strokeLine(ctx, line));

  handsOf(figure.mood, figure.swing ?? 0).forEach(([x, y]) => {
    circle(ctx, x, y, 15);
    ctx.fill();
  });

  drawItem(ctx, figure.mood, handsOf(figure.mood, figure.swing ?? 0)[1], 'cut');

  circle(ctx, centre.x, centre.y, head.radius + 12);
  ctx.fill();
  drawHat(ctx, figure.hat, figure.colour, { ...head, ...centre }, 'cut');
  ctx.restore();
};

// A few hairs, where the hat leaves the top of the head bare.
const drawHair = (ctx: CanvasRenderingContext2D, centre: Spot): void => {
  [-8, 0, 8].forEach((step) => strokeLine(ctx, [[centre.x + step, centre.y - head.radius], [centre.x + step * 1.6 - 3, centre.y - head.radius - 12]]));
};

// The drawing itself, in ink: body, hands, head, the face, and the hat.
const inkIn = (ctx: CanvasRenderingContext2D, figure: FigureDrawing, centre: Spot): void => {
  ctx.strokeStyle = paint.ink;
  ctx.lineWidth = 6;
  bodyLines(figure.mood, figure.swing ?? 0).forEach((line) => strokeLine(ctx, line));
  drawItem(ctx, figure.mood, handsOf(figure.mood, figure.swing ?? 0)[1], 'ink');
  ctx.strokeStyle = paint.ink;

  handsOf(figure.mood, figure.swing ?? 0).forEach(([x, y]) => {
    circle(ctx, x, y, 6);
    ctx.stroke();
  });

  circle(ctx, centre.x, centre.y, head.radius);
  ctx.stroke();

  if (showsHair(figure.hat)) drawHair(ctx, centre);

  drawFace(ctx, { ...figure, mood: figure.face ?? figure.mood }, centre);
  drawHat(ctx, figure.hat, figure.colour, { ...head, ...centre }, 'ink');
};

// One of a figure's hands on a little cardboard disc of its own, the size of the drawing's: drawn
// over the cards it holds up.
export const handSize = 64;

export const drawHand = (ctx: CanvasRenderingContext2D): void => {
  ctx.clearRect(0, 0, handSize, handSize);
  ctx.fillStyle = paint.card;
  circle(ctx, handSize / 2, handSize / 2, 26);
  ctx.fill();
  ctx.strokeStyle = paint.ink;
  ctx.lineWidth = 5;
  circle(ctx, handSize / 2, handSize / 2, 11);
  ctx.stroke();
};

// A player's stick figure (spec §8): ink lines on a cardboard cut-out, in a 90s hat of their
// colour, posed and pulling a face for how the game is going, eyes on whoever's turn it is.
export const drawFigure = (ctx: CanvasRenderingContext2D, figure: FigureDrawing): void => {
  const centre = { x: head.x, y: head.y + headDrop(figure.mood) };
  // Mirrored, the eyes still look where they should.
  const drawn = figure.mirrored ? { ...figure, look: { ...figure.look, x: -figure.look.x } } : figure;

  ctx.clearRect(0, 0, figureSize.width, figureSize.height);
  ctx.save();

  if (figure.mirrored) ctx.setTransform(-1, 0, 0, 1, figureSize.width, 0);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  cutOut(ctx, drawn, centre);
  inkIn(ctx, drawn, centre);
  ctx.restore();
};
