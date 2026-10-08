import { cardColours } from '@wild-table/protocol';
import { paint, suitPaint } from '../palette';

// The action cards' symbols and the wilds' four-colour sparkle, as closed shapes in a 100 × 100
// box. No words on the cards (spec §8.4).

interface Shape {
  path: Path2D;
  evenOdd?: boolean;
}

const polar = (radius: number, degrees: number): [number, number] => {
  const angle = (degrees * Math.PI) / 180;

  return [50 + radius * Math.cos(angle), 50 + radius * Math.sin(angle)];
};

const polygon = (points: Array<[number, number]>): Path2D => {
  const path = new Path2D();

  points.forEach(([x, y], index) => (index === 0 ? path.moveTo(x, y) : path.lineTo(x, y)));
  path.closePath();

  return path;
};

// Skip: a ring with a bar across it.
const skipShapes = (): Shape[] => {
  const ring = new Path2D();

  ring.arc(50, 50, 44, 0, Math.PI * 2);
  ring.arc(50, 50, 28, 0, Math.PI * 2, true);

  return [{ path: ring, evenOdd: true }, { path: polygon([polar(44, 129), polar(44, 141), polar(44, 309), polar(44, 321)]) }];
};

// One of Reverse's two arrows: a curved band from `from`° to `to`°, and its head.
const arrowShape = (from: number, to: number): Shape => {
  const band = new Path2D();
  const start = (from * Math.PI) / 180;
  const end = (to * Math.PI) / 180;
  const [tipX, tipY] = polar(32, to + 34);

  band.arc(50, 50, 40, start, end);
  band.lineTo(...polar(48, to));
  band.lineTo(tipX, tipY);
  band.lineTo(...polar(16, to));
  band.lineTo(...polar(24, to));
  band.arc(50, 50, 24, end, start, true);
  band.closePath();

  return { path: band };
};

// Reverse: two arrows chasing each other round.
const reverseShapes = (): Shape[] => [arrowShape(190, 300), arrowShape(10, 120)];

export const actionShapes = { skip: skipShapes, reverse: reverseShapes };

// The wilds' sparkle: the logo's four-pointed star.
export const sparklePath = (): Path2D => polygon([polar(48, -90), polar(14, -45), polar(48, 0), polar(14, 45), polar(48, 90), polar(14, 135), polar(48, 180), polar(14, 225)]);

// Shapes `size` wide centred on (x, y), in the cards' chunky style: a hard shadow, an ink outline
// and a cream fill.
export const drawChunkyShapes = (ctx: CanvasRenderingContext2D, shapes: Shape[], x: number, y: number, size: number, shadow: string): void => {
  const scale = size / 100;

  const pass = (dx: number, dy: number, paintShape: (shape: Shape) => void): void => {
    ctx.save();
    ctx.translate(x - size / 2 + dx, y - size / 2 + dy);
    ctx.scale(scale, scale);
    ctx.lineJoin = 'round';
    shapes.forEach(paintShape);
    ctx.restore();
  };

  const fill = (colour: string): ((shape: Shape) => void) => (shape) => {
    ctx.fillStyle = colour;
    ctx.fill(shape.path, shape.evenOdd ? 'evenodd' : 'nonzero');
  };

  const outline = (colour: string): ((shape: Shape) => void) => (shape) => {
    ctx.lineWidth = 13;
    ctx.strokeStyle = colour;
    ctx.stroke(shape.path);
  };

  pass(size * 0.055, size * 0.055, outline(shadow));
  pass(size * 0.055, size * 0.055, fill(shadow));
  pass(0, 0, outline(paint.ink));
  pass(0, 0, fill(paint.card));
};

// The sparkle `size` wide on (x, y), each quarter in one of the four colours, outlined in ink, with
// an optional cream rim outside the ink (on the wilds' black).
export const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, outline = 9, rim = false): void => {
  const scale = size / 100;
  const star = sparklePath();
  const quarters: Array<[number, number]> = [[50, 0], [50, 50], [0, 50], [0, 0]];

  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';

  if (rim) {
    ctx.lineWidth = outline * 2.6;
    ctx.strokeStyle = paint.card;
    ctx.stroke(star);
  }

  ctx.save();
  ctx.clip(star);

  cardColours.forEach((colour, index) => {
    const [left, top] = quarters[index] ?? [0, 0];

    ctx.fillStyle = suitPaint[colour].main;
    ctx.fillRect(left, top, 50, 50);
  });

  ctx.restore();
  ctx.lineJoin = 'round';
  ctx.lineWidth = outline;
  ctx.strokeStyle = paint.ink;
  ctx.stroke(star);
  ctx.restore();
};
