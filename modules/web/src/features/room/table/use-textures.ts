import { useEffect, useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { faceKey } from '@wild-table/engine';
import type { CardFace } from '@wild-table/protocol';
import { drawCardGlow, drawCassettePoster, drawDartboard, drawDirectionRing, drawFelt, drawShagRug, drawStainedGlass, drawSunsetPoster, drawLeafletCover, drawNeonSign, drawPanelling, drawTentCard } from '../../../art';

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

// The round's card faces, each made once and shared by every card with that face, so a card
// coming into play never waits for a new texture (spec §8.3).
const roundFaces = new Map<string, CanvasTexture>();

export const useRoundFaceTexture = (face: CardFace | null, draw: (face: CardFace) => HTMLCanvasElement | null): CanvasTexture | null =>
  useMemo(() => {
    if (!face) return null;

    const key = faceKey(face);
    const known = roundFaces.get(key);
    const canvas = known ? null : draw(face);

    if (!known && canvas) roundFaces.set(key, halfTurned(toTexture(canvas)));

    return roundFaces.get(key) ?? null;
  }, [face, draw]);

export const useDirectionRingTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawDirectionRing()), []));

export const useRugTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawShagRug()), []));

export const useStainedGlassTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawStainedGlass()), []));

export const usePosterTexture = (kind: 'sunset' | 'cassette'): CanvasTexture =>
  useDisposal(useMemo(() => toTexture(kind === 'sunset' ? drawSunsetPoster() : drawCassettePoster()), [kind]));

export const useDartboardTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawDartboard()), []));

export const useCardGlowTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawCardGlow()), []));

export const useFeltTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawFelt()), []));

export const usePanellingTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawPanelling(), 8), []));

export const useNeonTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawNeonSign()), []));

export const useLeafletTexture = (title: string, badge: string): CanvasTexture =>
  useDisposal(useMemo(() => toTexture(drawLeafletCover(title, badge)), [title, badge]));

export const useTentTexture = (name: string): CanvasTexture => useDisposal(useMemo(() => toTexture(drawTentCard(name, 'green')), [name]));
