import { artFont } from '../palette';

export interface ArtCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export const makeCanvas = (width: number, height: number): ArtCanvas => {
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No 2D canvas');

  return { canvas, ctx };
};

// The biggest size (up to `size`) at which `text` fits in `width`, set as the context's font.
export const fitFont = (ctx: CanvasRenderingContext2D, text: string, width: number, size: number, weight = 800): number => {
  let fitted = size;

  ctx.font = `${weight} ${fitted}px ${artFont}`;

  while (fitted > 10 && ctx.measureText(text).width > width) {
    fitted -= 2;
    ctx.font = `${weight} ${fitted}px ${artFont}`;
  }

  return fitted;
};
