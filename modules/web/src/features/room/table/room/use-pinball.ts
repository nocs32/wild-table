import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { CanvasTexture, SRGBColorSpace, type MeshBasicMaterial } from 'three';
import { drawPinballDisplay, pinballLineWidth } from '../../../../art';
import { glow } from '../palette';

// The display's resolution, and how fast a line scrolls across it (pixels a second).
const size = { width: 384, height: 96 };
const scrollSpeed = 150;
// The game's name, shown when nobody has won anything yet. Brand names aren't translated.
const idleLine = 'WILD TABLE';

export interface RoomTableRoomPinballParts {
  display: CanvasTexture;
  playfield: RefObject<MeshBasicMaterial | null>;
}

// The pinball machine, every frame (spec §8.1): its dot-matrix display shows the game's name, then
// scrolls who won the round, and at the podium the match's winner, flashing, while the playfield
// lights flash like a jackpot.
export const useRoomTableRoomPinball = (line: string, jackpot: boolean): RoomTableRoomPinballParts => {
  const canvas = useMemo(() => Object.assign(document.createElement('canvas'), size), []);
  const display = useMemo(() => Object.assign(new CanvasTexture(canvas), { colorSpace: SRGBColorSpace }), [canvas]);
  const playfield = useRef<MeshBasicMaterial>(null);
  const shown = useRef({ line: '', offset: 0, key: '' });

  useEffect(() => () => display.dispose(), [display]);

  useFrame(({ clock }, dt) => {
    const ctx = canvas.getContext('2d');
    const text = (line || idleLine).toLocaleUpperCase();
    const state = shown.current;

    if (!ctx) return;

    if (text !== state.line) Object.assign(state, { line: text, offset: 0 });

    const scrolls = line !== '';
    const bright = !jackpot || Math.floor(clock.elapsedTime * 4) % 2 === 0;

    state.offset = scrolls ? (state.offset + dt * scrollSpeed) % (size.width + pinballLineWidth(ctx, text) + 40) : 0;

    const key = `${text}|${Math.round(state.offset)}|${bright}`;

    if (key !== state.key) {
      state.key = key;
      drawPinballDisplay(ctx, text, scrolls ? state.offset : null, bright);
      display.needsUpdate = true;
    }

    playfield.current?.color.copy(glow.pink).multiplyScalar(jackpot ? 0.6 + Math.abs(Math.sin(clock.elapsedTime * 9)) * 1.4 : 1);
  });

  return { display, playfield };
};
