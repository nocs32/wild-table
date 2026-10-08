import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { CanvasTexture, SRGBColorSpace, type Group } from 'three';
import { drawFigure, figureSize } from '../../../../art';
import type { FigureView } from '../../../../stores/room/game/moods';

// A figure stands on the floor just outside the rail at its player's seat, tall enough to look over
// the table: table units.
export const figureHeight = 1.6;
export const figureWidth = (figureHeight * figureSize.width) / figureSize.height;
const reach = { x: 2.02, z: 1.68 };
const floor = -0.82;
// How long a reaction's hop lasts, in seconds.
const hopSeconds = 0.45;

export interface RoomTableRoundFigureParts {
  group: RefObject<Group | null>;
  texture: CanvasTexture;
}

// A player's stick figure, every frame (spec §8): redrawn only when its mood or gaze changes; it
// sways a little, hops when something happens to it, bounces while it cheers, shakes when angry
// and sags when sad.
export const useRoomTableRoundFigure = (view: FigureView): RoomTableRoundFigureParts => {
  const group = useRef<Group>(null);
  const canvas = useMemo(() => Object.assign(document.createElement('canvas'), { width: figureSize.width, height: figureSize.height }), []);
  const texture = useMemo(() => Object.assign(new CanvasTexture(canvas), { colorSpace: SRGBColorSpace, anisotropy: 4 }), [canvas]);
  const latest = useRef(view);
  const drawn = useRef({ key: '', reaction: -1, reactedAt: -10 });
  const phase = useMemo(() => (view.angle * 7.3) % (Math.PI * 2), [view.angle]);

  latest.current = view;
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    const current = latest.current;
    const state = drawn.current;
    const ctx = canvas.getContext('2d');

    if (ctx && current.key !== state.key) {
      drawFigure(ctx, current.drawing);
      texture.needsUpdate = true;
      state.key = current.key;
    }

    if (current.reaction !== state.reaction) Object.assign(state, { reaction: current.reaction, reactedAt: state.reaction < 0 ? -10 : now });

    if (!group.current) return;

    const turn = (current.angle * Math.PI) / 180;
    const hop = Math.min(1, (now - state.reactedAt) / hopSeconds);
    const { mood } = current.drawing;
    const lift = (hop < 1 ? Math.sin(hop * Math.PI) * 0.09 : 0) + (mood === 'cheer' ? Math.abs(Math.sin(now * 7 + phase)) * 0.05 : 0) - (mood === 'sad' ? 0.03 : 0);
    const shake = mood === 'angry' && hop < 1 ? Math.sin(now * 60) * 0.015 : 0;

    group.current.position.set(-Math.sin(turn) * reach.x + shake, floor + lift, Math.cos(turn) * reach.z);
    group.current.rotation.z = Math.sin(now * 1.3 + phase) * 0.025;
  });

  return { group, texture };
};
