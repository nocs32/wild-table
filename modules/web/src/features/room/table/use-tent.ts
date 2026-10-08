import { useMemo } from 'react';
import { felt } from './use-rail';

const width = 0.5;
const height = 0.25;
// How far each side leans back from upright.
const lean = 0.34;

// A tent card's two sides meeting at the top, like a folded place card.
export const tentShape = {
  width,
  height,
  front: { position: [0, (height / 2) * Math.cos(lean), (height / 2) * Math.sin(lean)] as [number, number, number], tilt: -lean },
  back: { position: [0, (height / 2) * Math.cos(lean), -(height / 2) * Math.sin(lean)] as [number, number, number], tilt: lean },
};

export interface TentSpot {
  position: [number, number, number];
  yaw: number;
  scale: number;
}

// In the lobby the tent cards stand in a row along the far edge of the felt, facing you, where
// everyone can see them over the deck. In a round that's where the player across from you holds
// their cards, so they shrink and move to the felt between the pile and the bell, two by two.
export const useRoomTableTentSpot = (index: number, count: number, inRound: boolean): TentSpot =>
  useMemo((): TentSpot => {
    if (inRound) return { position: [0.5 + (index % 2) * 0.28, 0, 0.5 - Math.floor(index / 2) * 0.2], yaw: -0.2, scale: 0.5 };

    const x = (index - (count - 1) / 2) * (width + 0.06);

    return { position: [x, 0, -felt.z * 0.66 + Math.abs(x) * 0.16], yaw: -x * 0.22, scale: 1 };
  }, [index, count, inRound]);
