import { cardColours } from '@wild-table/protocol';
import { paint, suitPaint } from '../palette';
import { cardHeight, cardWidth, drawCardStock, drawPanel } from './frame';
import { drawSparkle } from './icons';

const centreX = cardWidth / 2;
const centreY = cardHeight / 2;
const rays = 16;

// A sunburst in the four colours, darkening towards the edge.
const drawSunburst = (ctx: CanvasRenderingContext2D): void => {
  const reach = cardHeight;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(11, 11, cardWidth - 22, cardHeight - 22, 13);
  ctx.clip();

  Array.from({ length: rays }, (_, ray) => {
    const from = (ray / rays) * Math.PI * 2;
    const to = ((ray + 1) / rays) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(centreX, centreY);
    ctx.arc(centreX, centreY, reach, from, to);
    ctx.closePath();
    ctx.fillStyle = ray % 2 === 0 ? suitPaint[cardColours[(ray / 2) % 4] ?? 'red'].deep : paint.wild;
    ctx.fill();
  });

  const shade = ctx.createRadialGradient(centreX, centreY, 30, centreX, centreY, cardHeight * 0.62);

  shade.addColorStop(0, 'rgba(26, 20, 17, 0)');
  shade.addColorStop(1, 'rgba(26, 20, 17, 0.88)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, cardWidth, cardHeight);
  ctx.restore();
};

// The middle: a cream disc with an ink ring, holding the sparkle.
const drawSeal = (ctx: CanvasRenderingContext2D): void => {
  ctx.beginPath();
  ctx.arc(centreX, centreY, 62, 0, Math.PI * 2);
  ctx.fillStyle = paint.card;
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = paint.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(centreX, centreY, 53, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.stroke();
  drawSparkle(ctx, centreX, centreY, 92, 7);
};

// The back every card shares (no words, spec §8.4).
export const drawBack = (ctx: CanvasRenderingContext2D): void => {
  drawCardStock(ctx);
  drawPanel(ctx, paint.wild, 'rgba(255, 255, 255, 0)');
  drawSunburst(ctx);
  drawSeal(ctx);
};
