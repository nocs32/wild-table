import type { FigureMood, Line, Point } from './types';

// The figure's frame in canvas pixels: the head, and where the neck meets the shoulders and hips.
// The head sits low enough to leave room above it for the tallest hat.
export const head = { x: 128, y: 104, radius: 44 } as const;

const neck: Point = [128, head.y + head.radius];
const shoulder: Point = [128, 172];
const hip: Point = [128, 300];

const legs: Line[] = [
  [hip, [110, 380], [104, 452]],
  [hip, [146, 380], [152, 452]],
];

const feet: Line[] = [
  [[104, 452], [84, 454]],
  [[152, 452], [172, 454]],
];

// Sitting down (on the loveseat): the body sinks this far, onto bent legs.
const seatDrop = 58;

const seatedLegs: Line[] = [
  [[128, hip[1] + seatDrop], [96, 386], [98, 452], [80, 454]],
  [[128, hip[1] + seatDrop], [160, 386], [158, 452], [176, 454]],
];

const sitting: ReadonlySet<FigureMood> = new Set(['lounge']);

// Something held up to the mouth now and then (a soda, a slice of pizza): the right hand at the
// chest, and at the mouth while `s` is past halfway.
const sipping = (s: number): Line[] => [
  [shoulder, [100, 236], [94, 296]],
  s > 0 ? [shoulder, [180, 200], [152, 146]] : [shoulder, [178, 232], [170, 200]],
];

// Dancing to the jukebox: one hand pointing up at the ceiling, the other on the hip, swapping over.
const dancing = (s: number): Line[] =>
  [-1, 1].map((side): Line => (side === (s >= 0 ? 1 : -1) ? [shoulder, [128 + side * 48, 140], [128 + side * 84, 86]] : [shoulder, [128 + side * 36, 230], [128 + side * 12, 284]]));

// Holding up its cards on its turn (see `heldCardSpot`): both hands together in front of the chest,
// where the table puts the fan.
const holding = (s: number): Line[] => [
  [shoulder, [96, 238], [140, 214 + s * 2]],
  [shoulder, [184, 240], [160, 206 - s * 2]],
];

// Each mood's arms, shoulder to elbow to hand, at `s` (-1 to 1) through its gesture: a wave swings
// the hand, a clap brings the hands together, a cheer pumps the fists. On their turn, whatever their
// face, a figure holds its cards up.
const atRest = (s: number): Line[] => [
  [shoulder, [102 + s * 3, 236], [94 + s * 7, 296 - Math.abs(s) * 3]],
  [shoulder, [154 + s * 3, 236], [162 + s * 7, 296 - Math.abs(s) * 3]],
];

const arms: Record<FigureMood, (s: number) => Line[]> = {
  idle: atRest,
  wink: atRest,
  thinking: holding,
  concentrate: holding,
  confident: holding,
  nervous: holding,
  // In the lobby: lounging on the loveseat with the arms along its back, playing pinball (both
  // hands on the flippers, to the right, tapping), dancing, a soda, a slice of pizza.
  lounge: () => [
    [shoulder, [80, 200], [44, 214]],
    [shoulder, [176, 200], [212, 214]],
  ],
  pinball: (s) => [
    [shoulder, [150, 238], [198, 252 + s * 4]],
    [shoulder, [172, 230], [216, 242 - s * 4]],
  ],
  dance: dancing,
  soda: sipping,
  pizza: sipping,
  happy: (s) => [
    [shoulder, [100, 234], [90, 292]],
    [shoulder, [166, 196 - s * 3], [176, 146 - s * 9]],
  ],
  cheer: (s) => [
    [shoulder, [90, 128 + s * 5], [72, 66 + s * 11]],
    [shoulder, [166, 128 - s * 5], [184, 66 - s * 11]],
  ],
  sad: () => [
    [shoulder, [114, 240], [112, 304]],
    [shoulder, [142, 240], [144, 304]],
  ],
  surprised: (s) => [
    [shoulder, [80, 196], [58 + s * 3, 150]],
    [shoulder, [176, 196], [198 - s * 3, 150]],
  ],
  angry: (s) => [
    [shoulder, [86, 236 + s * 3], [122, 298 + s * 6]],
    [shoulder, [170, 236 - s * 3], [134, 298 - s * 6]],
  ],
  smug: () => [
    [shoulder, [98, 226], [152, 224]],
    [shoulder, [158, 232], [104, 218]],
  ],
  wave: (s) => [
    [shoulder, [102, 236], [94, 296]],
    [shoulder, [172 + s * 4, 140], [196 + s * 16, 88 + Math.abs(s) * 4]],
  ],
  clap: (s) => [
    [shoulder, [92, 226], [121 - (1 + s) * 6, 212]],
    [shoulder, [164, 226], [135 + (1 + s) * 6, 212]],
  ],
  frustrated: (s) => [
    [shoulder, [64, 164], [86 + s * 2, 98 + s * 4]],
    [shoulder, [192, 164], [170 - s * 2, 98 - s * 4]],
  ],
  taunt: () => [
    [shoulder, [60, 150], [78, 104]],
    [shoulder, [196, 150], [178, 104]],
  ],
};

// The taunt's fingers, spread up from the hands at the ears and wiggling (to the left of the left
// hand; mirrored on the right).
const tauntFingers: Point[] = [
  [-4, -18],
  [-13, -13],
  [-18, -3],
];

const fingers = (mood: FigureMood, swing: number): Line[] =>
  mood !== 'taunt'
    ? []
    : arms.taunt(swing).flatMap((arm) => {
        const [x, y] = arm[arm.length - 1] ?? [head.x, head.y];
        const side = x < head.x ? 1 : -1;

        return tauntFingers.map(([dx, dy], index): Line => [[x, y], [x + side * (dx + swing * (index - 1) * 3), y + dy + swing * 2]]);
      });

// How far the upper body sinks when sitting.
const bodyDrop = (mood: FigureMood): number => (sitting.has(mood) ? seatDrop : 0);

const sunk = (lines: Line[], drop: number): Line[] => lines.map((line) => line.map(([x, y]): Point => [x, y + drop]));

// How far the head drops: a sad figure hangs it, and it sinks with the body sitting down.
export const headDrop = (mood: FigureMood): number => (mood === 'sad' ? 8 : 0) + bodyDrop(mood);

// Every stroke of the body, neck to feet, in this mood's pose, `swing` through its gesture.
export const bodyLines = (mood: FigureMood, swing: number): Line[] => {
  const drop = bodyDrop(mood);
  const upper = sunk([[neck, hip], ...arms[mood](swing), ...fingers(mood, swing)], drop);

  return [...upper, ...(drop > 0 ? seatedLegs : [...legs, ...feet])];
};

export const handsOf = (mood: FigureMood, swing: number): Point[] => sunk(arms[mood](swing), bodyDrop(mood)).flatMap((arm) => arm.slice(-1));
