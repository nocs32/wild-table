// The deck's cards (spec §5.1). A card's face is public once it's on the pile; until then only its
// owner is sent it (D13).

export const cardColours = ['red', 'yellow', 'green', 'blue'] as const;

export type CardColour = (typeof cardColours)[number];

// Skip, Reverse and +2 hit the next player.
export const actionKinds = ['skip', 'reverse', 'draw2'] as const;

export type ActionKind = (typeof actionKinds)[number];

// Wild and Wild +4 have no colour until someone picks one.
export const wildKinds = ['wild', 'wild4'] as const;

export type WildKind = (typeof wildKinds)[number];

export type CardKind = 'number' | ActionKind | WildKind;

export interface NumberFace {
  kind: 'number';
  colour: CardColour;
  // 0 to 9.
  value: number;
}

export interface ActionFace {
  kind: ActionKind;
  colour: CardColour;
}

export interface WildFace {
  kind: WildKind;
}

export type ColouredFace = NumberFace | ActionFace;

export type CardFace = ColouredFace | WildFace;

// A card in the deck: its face, and an id that tells the copies of one face apart.
export type Card = CardFace & { id: string };

export const isWild = (face: CardFace): face is WildFace => face.kind === 'wild' || face.kind === 'wild4';
