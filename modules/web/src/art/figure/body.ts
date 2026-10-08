import type { FigureMood, Line, Point } from './types';

// The figure's frame in canvas pixels: the head, and where the neck meets the shoulders and hips.
export const head = { x: 128, y: 96, radius: 44 } as const;

const neck: Point = [128, 140];
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

// Each mood's arms, shoulder to elbow to hand. The thinking pose is the classic one: hand on the
// hip, finger on the chin.
const arms: Record<FigureMood, Line[]> = {
  idle: [
    [shoulder, [102, 236], [94, 296]],
    [shoulder, [154, 236], [162, 296]],
  ],
  thinking: [
    [shoulder, [88, 238], [120, 298]],
    [shoulder, [166, 222], [146, 146]],
  ],
  happy: [
    [shoulder, [100, 234], [90, 292]],
    [shoulder, [166, 196], [176, 146]],
  ],
  cheer: [
    [shoulder, [90, 128], [72, 66]],
    [shoulder, [166, 128], [184, 66]],
  ],
  sad: [
    [shoulder, [114, 240], [112, 304]],
    [shoulder, [142, 240], [144, 304]],
  ],
  surprised: [
    [shoulder, [80, 196], [58, 150]],
    [shoulder, [176, 196], [198, 150]],
  ],
  angry: [
    [shoulder, [86, 236], [122, 298]],
    [shoulder, [170, 236], [134, 298]],
  ],
  smug: [
    [shoulder, [98, 226], [152, 224]],
    [shoulder, [158, 232], [104, 218]],
  ],
  wave: [
    [shoulder, [102, 236], [94, 296]],
    [shoulder, [172, 140], [196, 88]],
  ],
};

// How far the head drops: a sad figure hangs it.
export const headDrop = (mood: FigureMood): number => (mood === 'sad' ? 8 : 0);

// Every stroke of the body, neck to feet, in this mood's pose.
export const bodyLines = (mood: FigureMood): Line[] => [[neck, hip], ...legs, ...feet, ...arms[mood]];

export const handsOf = (mood: FigureMood): Point[] => arms[mood].flatMap((arm) => arm.slice(-1));
