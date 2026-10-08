import { makeCanvas } from './canvas';

// The arrow ring glowing in the felt round the pile (spec §8.1): a thin circle with chevrons all
// pointing clockwise, white on clear, so the table can tint it with the colour in play and spin
// it the way play goes.
export const drawDirectionRing = (): HTMLCanvasElement => {
  const size = 512;
  const { canvas, ctx } = makeCanvas(size, size);
  const centre = size / 2;
  const radius = size * 0.43;
  const arrows = 8;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let arrow = 0; arrow < arrows; arrow++) {
    const from = (arrow / arrows) * Math.PI * 2 + 0.12;
    const to = from + (Math.PI * 2) / arrows - 0.34;

    ctx.beginPath();
    ctx.arc(centre, centre, radius, from, to);
    ctx.stroke();

    // The chevron at the arc's leading end, pointing along the circle.
    const tip = { x: centre + Math.cos(to + 0.1) * radius, y: centre + Math.sin(to + 0.1) * radius };
    const back = to - 0.07;

    ctx.beginPath();
    ctx.moveTo(centre + Math.cos(back) * (radius - 18), centre + Math.sin(back) * (radius - 18));
    ctx.lineTo(tip.x, tip.y);
    ctx.lineTo(centre + Math.cos(back) * (radius + 18), centre + Math.sin(back) * (radius + 18));
    ctx.stroke();
  }

  return canvas;
};
