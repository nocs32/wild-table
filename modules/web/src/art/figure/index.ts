import { paint } from '../palette';
import { bodyLines, handsOf, head, headDrop } from './body';
import { drawFace } from './face';
import { drawHat, showsHair } from './hat';
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
  bodyLines(figure.mood).forEach((line) => strokeLine(ctx, line));

  handsOf(figure.mood).forEach(([x, y]) => {
    circle(ctx, x, y, 15);
    ctx.fill();
  });

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
  bodyLines(figure.mood).forEach((line) => strokeLine(ctx, line));

  handsOf(figure.mood).forEach(([x, y]) => {
    circle(ctx, x, y, 6);
    ctx.stroke();
  });

  circle(ctx, centre.x, centre.y, head.radius);
  ctx.stroke();

  if (showsHair(figure.hat)) drawHair(ctx, centre);

  drawFace(ctx, figure, centre);
  drawHat(ctx, figure.hat, figure.colour, { ...head, ...centre }, 'ink');
};

// A player's stick figure (spec §8): ink lines on a cardboard cut-out, in a 90s hat of their
// colour, posed and pulling a face for how the game is going, eyes on whoever's turn it is.
export const drawFigure = (ctx: CanvasRenderingContext2D, figure: FigureDrawing): void => {
  const centre = { x: head.x, y: head.y + headDrop(figure.mood) };

  ctx.clearRect(0, 0, figureSize.width, figureSize.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  cutOut(ctx, figure, centre);
  inkIn(ctx, figure, centre);
};
