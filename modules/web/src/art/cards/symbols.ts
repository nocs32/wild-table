import type { CardColour } from '@wild-table/protocol';

// Each colour's own symbol (spec D22), so the cards work without telling colours apart: a bolt
// for red, a star for yellow, a leaf for green and a moon for blue. Drawn in a 100 × 100 box; the
// HTML's copies are assets/suits/*.svg.
const symbolPaths: Record<CardColour, string> = {
  red: 'M61 2 L18 58 L44 58 L33 98 L82 38 L56 38 L69 2 Z',
  yellow: 'M50 4 L61.8 37.6 L97.6 38.4 L69 60 L79.4 94.2 L50 73.8 L20.6 94.2 L31 60 L2.4 38.4 L38.2 37.6 Z',
  green: 'M86 10 C 90 52, 66 88, 18 90 C 12 50, 40 14, 86 10 Z',
  blue: 'M47.4 4.1 A 46 46 0 1 0 93.9 63.8 A 38 38 0 1 1 47.4 4.1 Z',
};

const cache = new Map<CardColour, Path2D>();

export const symbolPath = (colour: CardColour): Path2D => {
  const known = cache.get(colour);

  if (known) return known;

  const path = new Path2D(symbolPaths[colour]);

  cache.set(colour, path);

  return path;
};

// The leaf's vein, drawn over it.
export const leafVein = 'M80 16 C 58 38, 40 60, 24 84';

// Draws a symbol `size` wide centred on (x, y): `fill`, outlined in `outline`.
export const drawSymbol = (ctx: CanvasRenderingContext2D, colour: CardColour, x: number, y: number, size: number, fill: string, outline: string): void => {
  const scale = size / 100;

  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 9;
  ctx.strokeStyle = outline;
  ctx.stroke(symbolPath(colour));
  ctx.fillStyle = fill;
  ctx.fill(symbolPath(colour));

  if (colour === 'green') {
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke(new Path2D(leafVein));
  }

  ctx.restore();
};
