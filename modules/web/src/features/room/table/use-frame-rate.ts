import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

// How the frame rate is judged: over windows this long, frames slower than `slowFps` on average
// count against it, and this many slow windows in a row mean the game really stutters.
const windowSeconds = 5;
const slowFps = 35;
const slowWindowsNeeded = 2;
// A gap this long isn't a slow frame but a pause (a hidden tab, a resize, a long load): it's not
// counted at all.
const pauseSeconds = 0.25;

// Watches the 3D table's frame rate (spec §8.3) and calls `onStutter` once it stays low, so the
// graphics can get lighter. Pauses are ignored, so switching tabs or resizing never trips it.
export const useRoomTableFrameRate = (onStutter: () => void): void => {
  const state = useRef({ elapsed: 0, frames: 0, slowWindows: 0 });

  useFrame((_, dt) => {
    const current = state.current;

    if (dt > pauseSeconds) return;

    current.elapsed += dt;
    current.frames += 1;

    if (current.elapsed < windowSeconds) return;

    const slow = current.frames / current.elapsed < slowFps;

    current.slowWindows = slow ? current.slowWindows + 1 : 0;
    current.elapsed = 0;
    current.frames = 0;

    if (current.slowWindows >= slowWindowsNeeded) onStutter();
  });
};
