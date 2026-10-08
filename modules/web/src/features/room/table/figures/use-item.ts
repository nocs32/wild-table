import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { CanvasTexture, SRGBColorSpace, Vector3, type Group, type MeshStandardMaterial } from 'three';
import { drawFigure, figureSize } from '../../../../art';
import type { FigureView } from '../../../../stores/room/game/moods';
import { figurePlace } from '../../../../stores/table/round/figures';
import { glanceOf, isBlinking, newMotion, swingAt, type FigureMotion } from './motion';

// A figure's size (see `figurePlace`), table units.
export const figureHeight = figurePlace.height;
export const figureWidth = (figureHeight * figureSize.width) / figureSize.height;
// How long a reaction's hop lasts, in seconds.
const hopSeconds = 0.45;
// How bright the cardboard is: lit up on its turn, pulsing gently.
const glow = { rest: 0.3, turn: 0.75, pulse: 0.15 };
// Going somewhere (from the lobby to its seat when the cards are dealt): it glides there, hopping
// along the way (rates a second).
const glide = { rate: 2.4, hop: 0.08, hopRate: 11 };

export interface RoomTableFiguresItemParts {
  group: RefObject<Group | null>;
  material: RefObject<MeshStandardMaterial | null>;
  texture: CanvasTexture;
}

interface ItemState {
  key: string;
  reaction: number;
  reactedAt: number;
  // Where it stands now, on its way to its spot.
  at: Vector3 | null;
  motion: FigureMotion;
}

const target = new Vector3();

// A number of its own for each figure, so they don't all sway in step.
const phaseOf = (seat: string): number => [...seat].reduce((sum, char) => sum + (char.codePointAt(0) ?? 0), 0) % (Math.PI * 2);

// Moves the figure: towards its spot, a little sway, a hop when something happens to it, a bounce
// while it cheers, a shake when angry, a sag when sad.
const pose = (figure: Group, view: FigureView, state: ItemState, now: number, dt: number): void => {
  const phase = phaseOf(view.seat);
  const at = (state.at ??= new Vector3(...view.spot));
  const away = at.distanceTo(target.set(...view.spot));
  const hop = Math.min(1, (now - state.reactedAt) / hopSeconds);
  const { mood } = view.drawing;
  const walk = away > 0.02 ? Math.abs(Math.sin(now * glide.hopRate)) * glide.hop * Math.min(1, away * 2) : 0;
  const lift = walk + (hop < 1 ? Math.sin(hop * Math.PI) * 0.09 : 0) + (mood === 'cheer' ? Math.abs(Math.sin(now * 7 + phase)) * 0.05 : 0) - (mood === 'sad' ? 0.03 : 0);
  const shake = mood === 'angry' && hop < 1 ? Math.sin(now * 60) * 0.015 : 0;

  at.lerp(target, Math.min(1, dt * glide.rate));
  figure.position.set(at.x + shake, at.y + lift, at.z);
  figure.rotation.z = Math.sin(now * 1.3 + phase) * 0.025;
};

// A player's stick figure, every frame (spec §8): redrawn only when its mood, gaze, blink, glance or
// the step of its gesture changes; lit up on its turn.
export const useRoomTableFiguresItem = (view: FigureView): RoomTableFiguresItemParts => {
  const group = useRef<Group>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const canvas = useMemo(() => Object.assign(document.createElement('canvas'), { width: figureSize.width, height: figureSize.height }), []);
  const texture = useMemo(() => Object.assign(new CanvasTexture(canvas), { colorSpace: SRGBColorSpace, anisotropy: 4 }), [canvas]);
  const latest = useRef(view);
  const drawn = useRef<ItemState>({ key: '', reaction: -1, reactedAt: -10, at: null, motion: newMotion() });

  latest.current = view;
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }, dt) => {
    const now = clock.elapsedTime;
    const current = latest.current;
    const state = drawn.current;
    const ctx = canvas.getContext('2d');
    const { look, face } = glanceOf(state.motion, current, now);
    const shut = isBlinking(state.motion, now);
    const swing = swingAt(current.drawing.mood, now, phaseOf(current.seat));
    const key = `${current.key}|${shut}|${swing}|${look.x},${look.y}|${face ?? ''}`;

    if (ctx && key !== state.key) {
      drawFigure(ctx, { ...current.drawing, look, face, blink: shut, swing });
      texture.needsUpdate = true;
      state.key = key;
    }

    if (current.reaction !== state.reaction) Object.assign(state, { reaction: current.reaction, reactedAt: state.reaction < 0 ? -10 : now });

    if (group.current) pose(group.current, current, state, now, Math.min(dt, 0.1));

    if (material.current) material.current.emissiveIntensity = current.isTurn ? glow.turn + Math.sin(now * 4) * glow.pulse : glow.rest;
  });

  return { group, material, texture };
};
