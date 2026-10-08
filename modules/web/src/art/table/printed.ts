import type { CardColour } from '@wild-table/protocol';
import { drawChunkyText } from '../cards/frame';
import { drawSparkle } from '../cards/icons';
import { drawSymbol } from '../cards/symbols';
import { paint, suitPaint } from '../palette';
import { fitFont, makeCanvas } from './canvas';

// The game's printed things lying on the table: the rule leaflet and the house rules' tent cards,
// in the same 90s game-box style as the HTML's game cards.

const halftone = (ctx: CanvasRenderingContext2D, width: number, height: number, dots: string): void => {
  ctx.fillStyle = dots;

  for (let y = 0; y < height; y += 12) {
    for (let x = (y / 12) % 2 === 0 ? 0 : 6; x < width; x += 12) {
      const size = ((x / width + y / height) / 2 - 0.35) * 9;

      if (size > 0.4) {
        ctx.beginPath();
        ctx.arc(x, y, Math.min(size, 5.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
};

// A "NEW!" starburst.
const drawStarburst = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, text: string): void => {
  const points = 14;

  ctx.beginPath();

  Array.from({ length: points * 2 }, (_, index) => {
    const angle = (index / (points * 2)) * Math.PI * 2;
    const reach = index % 2 === 0 ? radius : radius * 0.72;

    ctx.lineTo(x + Math.cos(angle) * reach, y + Math.sin(angle) * reach);
  });

  ctx.closePath();
  ctx.fillStyle = paint.neonPink;
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = paint.ink;
  ctx.stroke();
  const size = fitFont(ctx, text, radius * 1.3, radius * 0.55);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.25);
  drawChunkyText(ctx, { text, x: 0, y: 0, size, shadow: paint.neonPinkDeep });
  ctx.restore();
};

// The rule leaflet's cover (spec §9.1): the card colours, the sparkle, "Wild Table", the title in
// this table's language, and a NEW! starburst. Portrait, 5 : 7.
export const drawLeafletCover = (title: string, badge: string): HTMLCanvasElement => {
  const width = 500;
  const height = 700;
  const { canvas, ctx } = makeCanvas(width, height);
  const stripe = height / 8;

  ctx.fillStyle = paint.card;
  ctx.fillRect(0, 0, width, height);

  (['red', 'yellow', 'green', 'blue'] as const).forEach((colour, index) => {
    ctx.fillStyle = suitPaint[colour].main;
    ctx.fillRect(0, height - stripe * (4 - index) * 0.5, width, stripe * 0.5);
  });

  ctx.fillStyle = suitPaint.red.main;
  ctx.fillRect(0, 0, width, height * 0.5);
  halftone(ctx, width, height * 0.5, suitPaint.red.deep);
  drawSparkle(ctx, width / 2, 150, 190, 10);
  drawChunkyText(ctx, { text: 'WILD TABLE', x: width / 2, y: 300, size: fitFont(ctx, 'WILD TABLE', width - 80, 54), shadow: suitPaint.red.deep });
  drawChunkyText(ctx, { text: title, x: width / 2, y: 440, size: fitFont(ctx, title, width - 70, 92), shadow: suitPaint.blue.deep });
  drawStarburst(ctx, width - 92, height * 0.5, 72, badge);
  ctx.lineWidth = 10;
  ctx.strokeStyle = paint.ink;
  ctx.strokeRect(0, 0, width, height);

  return canvas;
};

// A house rule's tent card: a printed band in the rule's colour with its symbol, and the rule's name.
export const drawTentCard = (name: string, colour: CardColour): HTMLCanvasElement => {
  const width = 512;
  const height = 256;
  const { canvas, ctx } = makeCanvas(width, height);
  const band = 70;

  ctx.fillStyle = paint.card;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = suitPaint[colour].main;
  ctx.fillRect(0, 0, width, band);
  halftone(ctx, width, band, suitPaint[colour].deep);
  drawSymbol(ctx, colour, width / 2, band / 2, 46, paint.card, paint.ink);
  ctx.fillStyle = paint.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  fitFont(ctx, name, width - 50, 64);
  ctx.fillText(name, width / 2, band + (height - band) / 2 + 4);
  ctx.lineWidth = 12;
  ctx.strokeStyle = paint.ink;
  ctx.strokeRect(0, 0, width, height);

  return canvas;
};
