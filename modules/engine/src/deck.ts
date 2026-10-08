// The 108-card deck (spec §5.1).
import { actionKinds, cardColours, isWild, type Card, type CardFace, type ColouredFace } from '@wild-table/protocol';

// A face's name, the same for every copy of it: 'red-7', 'blue-skip', 'wild4'.
export const faceKey = (face: CardFace): string => {
  if (face.kind === 'number') return `${face.colour}-${face.value}`;

  if (isWild(face)) return face.kind;

  return `${face.colour}-${face.kind}`;
};

const copies = (face: CardFace, count: number): Card[] => Array.from({ length: count }, (_, copy) => ({ ...face, id: `${faceKey(face)}.${copy}` }));

// Per colour: one 0, and two each of 1 to 9, Skip, Reverse and +2.
const colourFaces = (): Array<{ face: ColouredFace; count: number }> =>
  cardColours.flatMap((colour) => [
    { face: { kind: 'number' as const, colour, value: 0 }, count: 1 },
    ...Array.from({ length: 9 }, (_, index) => ({ face: { kind: 'number' as const, colour, value: index + 1 }, count: 2 })),
    ...actionKinds.map((kind) => ({ face: { kind, colour }, count: 2 })),
  ]);

// Four Wild and four Wild +4.
export const createDeck = (): Card[] => [
  ...colourFaces().flatMap(({ face, count }) => copies(face, count)),
  ...copies({ kind: 'wild' }, 4),
  ...copies({ kind: 'wild4' }, 4),
];

// Every distinct face once: 4 × 13 coloured faces, plus the two wilds. The card art draws these.
export const allFaces = (): CardFace[] => [...colourFaces().map(({ face }) => face), { kind: 'wild' }, { kind: 'wild4' }];
