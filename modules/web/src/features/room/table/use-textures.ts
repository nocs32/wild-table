import { useEffect, useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { drawFelt, drawLeafletCover, drawNeonSign, drawPanelling, drawTentCard } from '../../../art';

// The table's textures, drawn by code (spec §8.4) once and handed to the GPU. Each is thrown away
// when what it shows changes (a new language, say) or its owner goes.

const toTexture = (canvas: HTMLCanvasElement, repeat = 1): CanvasTexture => {
  const texture = new CanvasTexture(canvas);

  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  if (repeat !== 1) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeat, repeat / 4);
  }

  return texture;
};

const useDisposal = <T extends CanvasTexture | null>(texture: T): T => {
  useEffect(() => () => texture?.dispose(), [texture]);

  return texture;
};

// The underside of a card's slab shows its art upside down once the card turns over, so a face is
// printed half a turn round to read the right way up.
const halfTurned = (texture: CanvasTexture): CanvasTexture => {
  texture.center.set(0.5, 0.5);
  texture.rotation = Math.PI;

  return texture;
};

// A card's back.
export const useCardTexture = (canvas: HTMLCanvasElement | null): CanvasTexture | null =>
  useDisposal(useMemo(() => (canvas ? toTexture(canvas) : null), [canvas]));

// A card's face, for the underside of its slab.
export const useCardFaceTexture = (canvas: HTMLCanvasElement | null): CanvasTexture | null =>
  useDisposal(useMemo(() => (canvas ? halfTurned(toTexture(canvas)) : null), [canvas]));

export const useFeltTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawFelt()), []));

export const usePanellingTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawPanelling(), 8), []));

export const useNeonTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawNeonSign()), []));

export const useLeafletTexture = (title: string, badge: string): CanvasTexture =>
  useDisposal(useMemo(() => toTexture(drawLeafletCover(title, badge)), [title, badge]));

export const useTentTexture = (name: string): CanvasTexture => useDisposal(useMemo(() => toTexture(drawTentCard(name, 'green')), [name]));
