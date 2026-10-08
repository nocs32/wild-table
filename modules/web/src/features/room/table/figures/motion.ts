import type { FigureDrawing, FigureMood } from '../../../../art';
import type { FigureView } from '../../../../stores/room/game/moods';

// How a stick figure moves, frame by frame, without anything happening at the table (spec §8): its
// gestures a pose at a time, its blinks, and its glances about. Plain functions over a little state.

// Blinks: how long the eyes stay shut, and the wait before the next one (seconds).
const blink = { shut: 0.12, wait: 2.4, spread: 3.6, double: 0.2 };

// How each mood's gesture plays (see the art's `bodyLines`): `rate` swings a second, in `steps`
// poses either side of rest, like a cartoon drawn a pose at a time. With `every`, it plays in
// bursts of `burst` seconds: a thinker taps their chin now and then, an idle figure fidgets.
interface Gesture {
  rate: number;
  steps: number;
  every?: number;
  burst?: number;
}

const gestures: Partial<Record<FigureMood, Gesture>> = {
  wave: { rate: 1.6, steps: 1 },
  clap: { rate: 2.2, steps: 1 },
  cheer: { rate: 1.3, steps: 1 },
  angry: { rate: 2.6, steps: 1 },
  frustrated: { rate: 1.1, steps: 1 },
  taunt: { rate: 3.2, steps: 1 },
  surprised: { rate: 3, steps: 1, every: 3, burst: 0.8 },
  happy: { rate: 1.2, steps: 1, every: 4, burst: 1.7 },
  thinking: { rate: 1.6, steps: 1, every: 3.4, burst: 1.3 },
  concentrate: { rate: 1.2, steps: 1, every: 2.8, burst: 1 },
  nervous: { rate: 4, steps: 1, every: 2.2, burst: 0.7 },
  pinball: { rate: 3, steps: 1 },
  dance: { rate: 0.9, steps: 1 },
  soda: { rate: 0.5, steps: 1, every: 5, burst: 2 },
  pizza: { rate: 0.6, steps: 1, every: 4.5, burst: 1.7 },
  idle: { rate: 0.45, steps: 2, every: 7, burst: 2.2 },
};

// Where the mood's gesture is at `now`, -1 to 1, a whole step at a time; 0 between bursts.
export const swingAt = (mood: FigureMood, now: number, phase: number): number => {
  const gesture = gestures[mood];

  if (!gesture) return 0;

  const time = now + phase * 2;

  if (gesture.every && gesture.burst && time % gesture.every > gesture.burst) return 0;

  return Math.round(Math.sin(time * gesture.rate * Math.PI * 2) * gesture.steps) / gesture.steps;
};

interface Glance {
  look: { x: number; y: number };
  face: FigureMood | undefined;
  until: number;
  // A trick played on you, gone in a blink: the face, and until when.
  trick: { face: FigureMood; until: number } | null;
}

// When a figure next blinks and glances, and the glance it's in.
export interface FigureMotion {
  blinkAt: number;
  glanceAt: number;
  glance: Glance | null;
}

// Now and then a figure that's only watching blinks and glances at someone else at the table, or at
// you, for a moment, sometimes with a smile or a smirk (seconds).
const glancing = { every: 5, spread: 7, hold: 1.2, holdSpread: 1, faceChance: 0.35, atYou: 0.25 };
const glanceFaces: readonly FigureMood[] = ['happy', 'smug'];
const calmMoods: ReadonlySet<FigureMood> = new Set(['idle', 'happy']);

// Rarely, a glance at you hides a trick, gone before you're sure you saw it: a raspberry or a wink,
// then a straight face.
const tricks: ReadonlyArray<{ face: FigureMood; chance: number; hold: number }> = [
  { face: 'taunt', chance: 0.07, hold: 0.4 },
  { face: 'wink', chance: 0.05, hold: 0.6 },
];

const pickFrom = <T>(items: readonly T[]): T | undefined => items[Math.floor(Math.random() * items.length)];

const pickTrick = (now: number): Glance['trick'] => {
  const roll = Math.random();
  const trick = tricks.find((_, index) => roll < tricks.slice(0, index + 1).reduce((sum, each) => sum + each.chance, 0));

  return trick ? { face: trick.face, until: now + blink.shut + trick.hold } : null;
};

const startGlance = (view: FigureView, now: number): Glance | null => {
  const atYou = view.you !== null && Math.random() < glancing.atYou;
  const look = atYou ? view.you : pickFrom(view.glances);
  const trick = atYou ? pickTrick(now) : null;
  const face = !trick && Math.random() < glancing.faceChance ? pickFrom(glanceFaces) : undefined;

  return look ? { look, face, trick, until: now + glancing.hold + Math.random() * glancing.holdSpread } : null;
};

// Starts a glance when one's due and the figure is calm, ends it when it's over or something
// happens to the figure; gives the look and the face to draw.
export const glanceOf = (state: FigureMotion, view: FigureView, now: number): Pick<FigureDrawing, 'look' | 'face'> => {
  const calm = calmMoods.has(view.drawing.mood);

  if (state.glance && (now > state.glance.until || !calm)) state.glance = null;

  if (!state.glance && calm && now > state.glanceAt) {
    state.glance = startGlance(view, now);
    state.glanceAt = (state.glance?.until ?? now) + glancing.every + Math.random() * glancing.spread;
    // A blink first, then the eyes are somewhere else.
    state.blinkAt = now;
  }

  const trick = state.glance?.trick;

  return { look: state.glance?.look ?? view.drawing.look, face: trick && now < trick.until ? trick.face : state.glance?.face };
};

// The eyes shut for a moment every few seconds, now and then twice in a row.
export const isBlinking = (state: FigureMotion, now: number): boolean => {
  if (now < state.blinkAt) return false;

  if (now < state.blinkAt + blink.shut) return true;

  state.blinkAt = now + (Math.random() < blink.double ? blink.shut * 1.5 : blink.wait + Math.random() * blink.spread);

  return false;
};

export const newMotion = (): FigureMotion => ({ blinkAt: 1 + Math.random() * blink.spread, glanceAt: 3 + Math.random() * glancing.spread, glance: null });
