import { createRandom } from '@wild-table/engine';
import { paint, suitPaint } from '../palette';
import { makeCanvas } from '../table/canvas';

// The basement's things drawn by code (spec §8.1, §8.4): a shag rug, the hanging lamp's stained
// glass, two posters and a dartboard. Colours from the design system; no words, so nothing to
// translate.

// A 70s shag rug: rings of burnt orange, mustard and brown, and thousands of little strands.
export const drawShagRug = (): HTMLCanvasElement => {
  const size = 512;
  const { canvas, ctx } = makeCanvas(size, size);
  const random = createRandom(23);
  const rings = [paint.woodLight, suitPaint.yellow.deep, paint.woodBase, suitPaint.red.deep, paint.woodGrain, suitPaint.yellow.deep];

  rings.forEach((colour, index) => {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, (size / 2) * (1 - index / rings.length), 0, Math.PI * 2);
    ctx.fill();
  });

  for (let strand = 0; strand < 26000; strand++) {
    const x = random() * size;
    const y = random() * size;
    const angle = random() * Math.PI * 2;

    ctx.strokeStyle = random() < 0.5 ? 'rgba(255, 230, 190, 0.08)' : 'rgba(20, 8, 0, 0.16)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * 4, y + Math.sin(angle) * 4);
    ctx.stroke();
  }

  return canvas;
};

// The hanging lamp's shade: panes of coloured glass in the four card colours, leaded in black.
export const drawStainedGlass = (): HTMLCanvasElement => {
  const width = 512;
  const height = 128;
  const { canvas, ctx } = makeCanvas(width, height);
  const colours = [suitPaint.red.main, suitPaint.yellow.main, suitPaint.green.main, suitPaint.blue.main];
  const panes = 12;

  for (let pane = 0; pane < panes; pane++) {
    ctx.fillStyle = colours[pane % colours.length] ?? paint.lamp;
    ctx.fillRect((pane / panes) * width, 0, width / panes, height * 0.62);
    ctx.fillStyle = paint.lamp;
    ctx.fillRect((pane / panes) * width, height * 0.62, width / panes, height * 0.38);
  }

  ctx.strokeStyle = paint.wild;
  ctx.lineWidth = 6;

  for (let pane = 0; pane <= panes; pane++) {
    ctx.beginPath();
    ctx.moveTo((pane / panes) * width, 0);
    ctx.lineTo((pane / panes) * width, height);
    ctx.stroke();
  }

  [0.04, 0.62, 0.96].forEach((at) => {
    ctx.beginPath();
    ctx.moveTo(0, height * at);
    ctx.lineTo(width, height * at);
    ctx.stroke();
  });

  return canvas;
};

// A synthwave sunset poster: a striped sun sinking behind a glowing grid.
export const drawSunsetPoster = (): HTMLCanvasElement => {
  const width = 300;
  const height = 420;
  const { canvas, ctx } = makeCanvas(width, height);
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.62);

  sky.addColorStop(0, paint.wild);
  sky.addColorStop(1, paint.neonPinkDeep);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = paint.lamp;
  ctx.beginPath();
  ctx.arc(width / 2, height * 0.58, 92, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = paint.neonPinkDeep;
  [0, 1, 2, 3, 4].forEach((stripe) => ctx.fillRect(0, height * 0.58 - 12 - stripe * 15, width, 5 + stripe * 0.6));
  ctx.fillStyle = paint.wild;
  ctx.fillRect(0, height * 0.58, width, height);
  ctx.strokeStyle = paint.neonCyan;
  ctx.lineWidth = 2;

  for (let line = 0; line < 9; line++) {
    const y = height * 0.58 + (line * line * 3.4 + 4);

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  for (let line = -6; line <= 6; line++) {
    ctx.beginPath();
    ctx.moveTo(width / 2 + line * 10, height * 0.58);
    ctx.lineTo(width / 2 + line * 70, height);
    ctx.stroke();
  }

  ctx.strokeStyle = paint.card;
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, width, height);

  return canvas;
};

// A cassette tape poster, the tape tilted on a teal ground.
export const drawCassettePoster = (): HTMLCanvasElement => {
  const width = 300;
  const height = 420;
  const { canvas, ctx } = makeCanvas(width, height);

  ctx.fillStyle = suitPaint.blue.deep;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-0.18);
  ctx.fillStyle = paint.ink;
  ctx.beginPath();
  ctx.roundRect(-118, -76, 236, 152, 12);
  ctx.fill();
  ctx.fillStyle = paint.lamp;
  ctx.fillRect(-104, -62, 208, 64);
  ctx.fillStyle = suitPaint.red.main;
  ctx.fillRect(-104, -62, 208, 14);
  ctx.fillStyle = paint.ink;
  ctx.beginPath();
  ctx.roundRect(-62, -24, 124, 40, 20);
  ctx.fill();
  ctx.fillStyle = paint.card;

  [-38, 38].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, -4, 13, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = paint.shade;
  ctx.fillRect(-70, 38, 140, 30);
  ctx.restore();
  ctx.strokeStyle = paint.card;
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, width, height);

  return canvas;
};

// A pub dartboard: twenty segments in ink and cream, red and green rings, and the bull.
export const drawDartboard = (): HTMLCanvasElement => {
  const size = 256;
  const { canvas, ctx } = makeCanvas(size, size);
  const centre = size / 2;

  const ring = (radius: number, odd: string, even: string): void => {
    for (let segment = 0; segment < 20; segment++) {
      const from = ((segment - 0.5) / 20) * Math.PI * 2;

      ctx.fillStyle = segment % 2 ? odd : even;
      ctx.beginPath();
      ctx.moveTo(centre, centre);
      ctx.arc(centre, centre, radius, from, from + Math.PI / 10);
      ctx.fill();
    }
  };

  ctx.fillStyle = paint.ink;
  ctx.beginPath();
  ctx.arc(centre, centre, centre, 0, Math.PI * 2);
  ctx.fill();
  ring(centre * 0.86, suitPaint.red.main, suitPaint.green.main);
  ring(centre * 0.8, paint.ink, paint.shade);
  ring(centre * 0.52, suitPaint.red.main, suitPaint.green.main);
  ring(centre * 0.46, paint.ink, paint.shade);
  ctx.fillStyle = suitPaint.green.main;
  ctx.beginPath();
  ctx.arc(centre, centre, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = suitPaint.red.main;
  ctx.beginPath();
  ctx.arc(centre, centre, 5, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
};
