import { createRandom } from '@wild-table/engine';
import { sparklePath } from '../cards/icons';
import { paint } from '../palette';
import { makeCanvas } from './canvas';

// The felt: speckled cloth, a printed brass line round the edge, and the logo's sparkle faint in
// the middle. Drawn square: the table stretches it into its oval.
export const drawFelt = (): HTMLCanvasElement => {
  const size = 1024;
  const { canvas, ctx } = makeCanvas(size, size);
  const random = createRandom(7);

  ctx.fillStyle = paint.feltBase;
  ctx.fillRect(0, 0, size, size);

  for (let speck = 0; speck < 30000; speck++) {
    ctx.fillStyle = random() < 0.5 ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(random() * size, random() * size, 1.6, 1.6);
  }

  ctx.strokeStyle = 'rgba(221, 189, 120, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.445, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.43, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.translate(size / 2 - 150, size / 2 - 150);
  ctx.scale(3, 3);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
  ctx.fill(sparklePath());
  ctx.restore();

  return canvas;
};

// Walnut panelling for the back wall: planks of slightly different browns, grooves between them,
// and grain.
export const drawPanelling = (): HTMLCanvasElement => {
  const size = 512;
  const plank = 64;
  const { canvas, ctx } = makeCanvas(size, size);
  const random = createRandom(11);
  const browns = [paint.woodBase, paint.woodDark, paint.woodLight];

  for (let x = 0; x < size; x += plank) {
    ctx.fillStyle = browns[Math.floor(random() * browns.length)] ?? paint.woodBase;
    ctx.fillRect(x, 0, plank, size);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = 1;

    for (let line = 0; line < 9; line++) {
      const start = x + 4 + random() * (plank - 8);

      ctx.beginPath();
      ctx.moveTo(start, 0);
      ctx.bezierCurveTo(start + random() * 8 - 4, size * 0.33, start + random() * 8 - 4, size * 0.66, start + random() * 6 - 3, size);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(x, 0, 3, size);
  }

  return canvas;
};
