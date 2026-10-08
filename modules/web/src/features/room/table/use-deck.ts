import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import type { Group } from 'three';
import { cardSize, type TableCardBody } from '../../../stores/table/body';
import type { TableDeckStore } from '../../../stores/table/deck';
import { Spring } from '../../../utils/spring';

export type RoomTableDeckRegister = (id: number, group: Group | null) => void;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

// Puts a card's group where its body is. Turning over, it rises by half its width, so it never
// cuts through the felt.
const place = (group: Group, body: TableCardBody, lift: number): void => {
  const flip = body.flip.value;
  const card = group.children[0];

  group.position.set(body.x.value, body.y.value + lift + Math.sin(Math.PI * clamp01(flip)) * cardSize.width * 0.5, body.z.value);
  group.rotation.set(body.tiltX.value, body.yaw.value, body.tiltZ.value, 'YXZ');

  if (card) card.rotation.z = Math.PI * flip;
};

// The deck's frame loop, outside React (spec §8.3): steps every card's springs, lifts the top card
// while the deck is pointed at, and moves the meshes. Returns how each card's group signs up.
export const useRoomTableDeckFrames = (deck: TableDeckStore): RoomTableDeckRegister => {
  const groups = useRef(new Map<number, Group>());
  const lift = useRef(new Spring(0, 320, 22));

  useEffect(() => () => deck.dispose(), [deck]);

  useFrame((_, dt) => {
    const hovered = deck.hoveredId;
    const top = deck.topId;

    deck.step(dt, performance.now());
    lift.current.target = hovered !== null && deck.isInDeck(hovered) && deck.state === 'idle' ? 0.035 : 0;
    lift.current.step(dt);

    groups.current.forEach((group, id) => {
      const body = deck.bodies[id];

      if (body) place(group, body, id === top ? lift.current.value : 0);
    });
  });

  return useCallback((id: number, group: Group | null) => {
    if (group) groups.current.set(id, group);
    else groups.current.delete(id);
  }, []);
};
