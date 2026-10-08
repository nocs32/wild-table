import { faceKey } from '@wild-table/engine';
import type { CardFace } from '@wild-table/protocol';
import { drawCardBack, drawCardFace } from '../art';
import { artFont } from '../art/palette';
import type { CardArtService } from './types';

// Each face is drawn once, the first time it's needed, and kept: as a canvas for the 3D table's
// textures and as an image for the HTML (the rule book's examples). Drawing waits for the
// typeface, so `load` must have finished first.
export const createCardArt = (scale: number): CardArtService => {
  const canvases = new Map<string, HTMLCanvasElement>();
  const urls = new Map<string, string>();

  const canvasOf = (key: string, draw: () => HTMLCanvasElement): HTMLCanvasElement => {
    const canvas = canvases.get(key) ?? draw();

    canvases.set(key, canvas);

    return canvas;
  };

  const urlOf = (key: string, canvas: () => HTMLCanvasElement): string => {
    const url = urls.get(key) ?? canvas().toDataURL('image/png');

    urls.set(key, url);

    return url;
  };

  const faceCanvas = (face: CardFace): HTMLCanvasElement => canvasOf(faceKey(face), () => drawCardFace(face, scale));
  const backCanvas = (): HTMLCanvasElement => canvasOf('back', () => drawCardBack(scale));

  return {
    load: () => document.fonts.load(`800 100px ${artFont}`).then(() => undefined),
    faceCanvas,
    backCanvas,
    faceUrl: (face) => urlOf(faceKey(face), () => faceCanvas(face)),
    backUrl: () => urlOf('back', backCanvas),
  };
};
