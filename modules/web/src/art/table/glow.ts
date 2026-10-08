import { makeCanvas } from './canvas';

// The halo behind a card you can play (spec D7): a soft white glow round a card's edge, clear in
// the middle, so the table can tint it lamp-gold and the bloom makes it shine.
export const drawCardGlow = (): HTMLCanvasElement => {
  const width = 390;
  const height = 520;
  const inset = 46;
  const { canvas, ctx } = makeCanvas(width, height);

  ctx.shadowColor = 'white';
  ctx.shadowBlur = 30;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 12;

  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    ctx.roundRect(inset, inset, width - inset * 2, height - inset * 2, 26);
    ctx.stroke();
  }

  return canvas;
};
