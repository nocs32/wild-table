import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { CanvasTexture, SRGBColorSpace, type Group } from 'three';
import { drawHand, handSize } from '../../../../art';
import type { FigureView } from '../../../../stores/room/game/moods';
import type { TableRoundStore } from '../../../../stores/table/round';
import { figureSide, heldHandsSpot } from '../../../../stores/table/round/figures';

// The two hands holding the fan, around its bottom (table units, across and up as you see them),
// and how big each is.
export const heldHandSpots: Array<[number, number, number]> = [
  [-0.035, -0.012, 0],
  [0.032, 0.022, 0],
];

export const heldHandSize = 0.165;

// How long the cards take to come up off the felt before the hands close on them, in seconds.
const reachSeconds = 0.3;

export interface RoomTableFiguresItemHandsParts {
  group: RefObject<Group | null>;
  flip: RefObject<Group | null>;
  texture: CanvasTexture;
}

// The hands holding someone's cards up on their turn (see `heldHandsSpot`), every frame: over the
// bottom of the fan once the cards are up, so it's held, not floating; on the left of a mirrored
// figure's fan.
export const useRoomTableFiguresItemHands = (view: FigureView, round: TableRoundStore): RoomTableFiguresItemHandsParts => {
  const group = useRef<Group>(null);
  const flip = useRef<Group>(null);

  const texture = useMemo(() => {
    const canvas = Object.assign(document.createElement('canvas'), { width: handSize, height: handSize });
    const ctx = canvas.getContext('2d');

    if (ctx) drawHand(ctx);

    return Object.assign(new CanvasTexture(canvas), { colorSpace: SRGBColorSpace });
  }, []);

  const latest = useRef(view);
  const since = useRef<number | null>(null);

  latest.current = view;
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    const { isHolding, angle, cards } = latest.current;

    since.current = isHolding ? (since.current ?? clock.elapsedTime) : null;

    if (!group.current) return;

    group.current.visible = since.current !== null && clock.elapsedTime - since.current > reachSeconds;
    group.current.position.set(...heldHandsSpot(round.frame, angle, cards));
    flip.current?.scale.set(figureSide(angle), 1, 1);
  });

  return { group, flip, texture };
};
