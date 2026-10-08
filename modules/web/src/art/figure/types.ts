// A player's stick figure at the table (spec §8): how they feel, where they look, and their hat.

// What a figure is feeling, each with a pose and a face.
export const figureMoods = ['idle', 'thinking', 'happy', 'cheer', 'sad', 'surprised', 'angry', 'smug', 'wave', 'clap', 'frustrated', 'taunt', 'concentrate', 'confident', 'nervous', 'wink', 'lounge', 'pinball', 'dance', 'soda', 'pizza'] as const;

export type FigureMood = (typeof figureMoods)[number];

// 90s hats, one per player; bots wear the propeller beanie.
export const figureHats = ['cap', 'bucket', 'beanie', 'bandana', 'visor', 'headphones'] as const;

export type FigureHat = (typeof figureHats)[number] | 'propeller';

export interface FigureDrawing {
  mood: FigureMood;
  // Where the eyes look, -1 to 1: right and up are positive.
  look: { x: number; y: number };
  hat: FigureHat;
  // The hat's colour: the player's own.
  colour: string;
  // Eyes shut for a blink.
  blink?: boolean;
  // How far through its gesture the pose is, -1 to 1: a wave's hand from one side to the other, a
  // clap's hands from together to apart. 0 is the pose at rest.
  swing?: number;
  // Drawn the other way round: a figure on the right of the table holds things on its left.
  mirrored?: boolean;
  // A face of another mood for a moment, the pose unchanged: a smile while glancing at someone.
  face?: FigureMood;
}

export type Point = readonly [number, number];

export type Line = readonly Point[];

// The canvas a figure is drawn on, in pixels: tall, for long legs.
export const figureSize = { width: 256, height: 464 } as const;
