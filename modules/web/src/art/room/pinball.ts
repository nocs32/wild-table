import { artFont, paint } from '../palette';

// The pinball machine's score display (spec §8.1): a 90s dot-matrix screen, amber dots on black.
// The line is drawn `offset` pixels in from the right edge when it scrolls, or centred when it
// doesn't; `bright` lights it fully (it flashes at the podium).
export const drawPinballDisplay = (ctx: CanvasRenderingContext2D, line: string, offset: number | null, bright: boolean): void => {
  const { width, height } = ctx.canvas;
  const dot = height / 24;

  ctx.fillStyle = paint.ink;
  ctx.fillRect(0, 0, width, height);
  ctx.font = `900 ${Math.round(height * 0.62)}px ${artFont}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = offset === null ? 'center' : 'left';
  ctx.fillStyle = paint.lamp;
  ctx.globalAlpha = bright ? 1 : 0.72;
  ctx.fillText(line, offset === null ? width / 2 : width - offset, height * 0.54);
  ctx.globalAlpha = 1;

  // The gaps between the dots.
  ctx.fillStyle = paint.ink;

  for (let x = 0; x < width; x += dot) ctx.fillRect(x, 0, dot * 0.3, height);

  for (let y = 0; y < height; y += dot) ctx.fillRect(0, y, width, dot * 0.3);
};

// How wide a line is on the display, to know when it has scrolled past.
export const pinballLineWidth = (ctx: CanvasRenderingContext2D, line: string): number => {
  ctx.font = `900 ${Math.round(ctx.canvas.height * 0.62)}px ${artFont}`;

  return ctx.measureText(line).width;
};
