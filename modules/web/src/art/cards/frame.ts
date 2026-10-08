import { artFont, paint } from '../palette';

// Every card is drawn in a 250 × 350 box (a playing card's 5 : 7), then scaled.
export const cardWidth = 250;
export const cardHeight = 350;

const radius = 20;
const inset = 11;
const innerRadius = 13;

const panelRect = (ctx: CanvasRenderingContext2D): void => {
  ctx.beginPath();
  ctx.roundRect(inset, inset, cardWidth - inset * 2, cardHeight - inset * 2, innerRadius);
};

// The card stock: a cream border with an ink edge, like a 90s trading card.
export const drawCardStock = (ctx: CanvasRenderingContext2D): void => {
  ctx.beginPath();
  ctx.roundRect(1, 1, cardWidth - 2, cardHeight - 2, radius);
  ctx.fillStyle = paint.card;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = paint.ink;
  ctx.stroke();
};

// 90s print shading: halftone dots that grow towards the bottom-right corner.
const drawHalftone = (ctx: CanvasRenderingContext2D, dots: string): void => {
  const step = 9;

  ctx.fillStyle = dots;

  for (let row = 0; row * step < cardHeight; row++) {
    for (let x = (row % 2) * (step / 2); x < cardWidth; x += step) {
      const y = row * step;
      const size = ((x / cardWidth + y / cardHeight) / 2 - 0.42) * 7.5;

      if (size > 0.3) {
        ctx.beginPath();
        ctx.arc(x, y, Math.min(size, step / 2), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
};

// Light catching the glossy coating across the top-left.
const drawGloss = (ctx: CanvasRenderingContext2D): void => {
  const gloss = ctx.createLinearGradient(0, 0, cardWidth * 0.7, cardHeight * 0.5);

  gloss.addColorStop(0, 'rgba(255, 255, 255, 0.26)');
  gloss.addColorStop(0.45, 'rgba(255, 255, 255, 0.06)');
  gloss.addColorStop(0.46, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, cardWidth, cardHeight);
};

// The printed panel inside the border: `fill`, its halftone in `dots`, the gloss, an ink keyline.
export const drawPanel = (ctx: CanvasRenderingContext2D, fill: string, dots: string): void => {
  ctx.save();
  panelRect(ctx);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.clip();
  drawHalftone(ctx, dots);
  drawGloss(ctx);
  ctx.restore();
  panelRect(ctx);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = paint.ink;
  ctx.stroke();
};

export interface ChunkyText {
  text: string;
  x: number;
  y: number;
  size: number;
  // The hard drop shadow's colour.
  shadow: string;
}

// Big 90s lettering: cream, a thick ink outline, and a hard shadow down and to the right. Centred
// on (x, y) by the glyphs' own bounds.
export const drawChunkyText = (ctx: CanvasRenderingContext2D, { text, x, y, size, shadow }: ChunkyText): void => {
  ctx.font = `800 ${size}px ${artFont}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';

  const box = ctx.measureText(text);
  const baseline = y + (box.actualBoundingBoxAscent - box.actualBoundingBoxDescent) / 2;
  const drop = size * 0.055;

  ctx.lineWidth = size * 0.13;
  ctx.strokeStyle = shadow;
  ctx.fillStyle = shadow;
  ctx.strokeText(text, x + drop, baseline + drop);
  ctx.fillText(text, x + drop, baseline + drop);
  ctx.strokeStyle = paint.ink;
  ctx.strokeText(text, x, baseline);
  ctx.fillStyle = paint.card;
  ctx.fillText(text, x, baseline);
};

// Draws `corner` at the top left, and again upside down at the bottom right.
export const drawCorners = (ctx: CanvasRenderingContext2D, corner: () => void): void => {
  corner();
  ctx.save();
  ctx.translate(cardWidth, cardHeight);
  ctx.rotate(Math.PI);
  corner();
  ctx.restore();
};
