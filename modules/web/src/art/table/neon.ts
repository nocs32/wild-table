import { sparklePath } from '../cards/icons';
import { artFont, paint } from '../palette';
import { makeCanvas } from './canvas';

// Neon tubes: a wide coloured glow, then a near-white core.
const tube = (ctx: CanvasRenderingContext2D, colour: string, draw: () => void): void => {
  ctx.save();
  ctx.shadowColor = colour;
  ctx.shadowBlur = 28;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 11;
  draw();
  ctx.shadowBlur = 8;
  ctx.strokeStyle = 'rgba(255, 245, 250, 0.95)';
  ctx.lineWidth = 3.5;
  draw();
  ctx.restore();
};

const roundedCard = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.roundRect(-46, -64, 92, 128, 14);
  ctx.stroke();
  ctx.restore();
};

// The neon sign on the back wall (spec §8.1): the logo's two cards and sparkle, and the name.
export const drawNeonSign = (): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(1024, 320);

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  tube(ctx, paint.neonCyan, () => roundedCard(ctx, 120, 160, -0.26));
  tube(ctx, paint.neonCyan, () => roundedCard(ctx, 190, 160, 0.18));

  tube(ctx, paint.lamp, () => {
    ctx.save();
    ctx.translate(140, 110);
    ctx.scale(1.1, 1.1);
    ctx.stroke(sparklePath());
    ctx.restore();
  });

  ctx.font = `800 118px ${artFont}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  tube(ctx, paint.neonPink, () => ctx.strokeText('WILD TABLE', 290, 166));

  return canvas;
};
