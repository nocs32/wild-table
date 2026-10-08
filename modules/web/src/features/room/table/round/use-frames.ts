import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import { Vector3, type Camera, type Group, type Mesh, type MeshBasicMaterial, type MeshStandardMaterial } from 'three';
import type { RoomGameStore } from '../../../../stores/room/game';
import { cardSize } from '../../../../stores/table/body';
import type { TableRoundStore } from '../../../../stores/table/round';
import type { TableRoundBody } from '../../../../stores/table/round/body';
import type { HandFrame } from '../../../../stores/table/round/layout';

export type RoomTableRoundRegister = (key: string, group: Group | null) => void;

// Your hand sits this far in front of the camera, this far down the view (in screen units, -1 to 1).
const handDistance = 1.7;
const handHeight = -0.72;

const scratch = { at: new Vector3(), left: new Vector3(), right: new Vector3(), across: new Vector3(), up: new Vector3(), forward: new Vector3() };

// A point `handDistance` away along the line through the view at (x, y): the shifted view of a
// round is taken into account by unprojecting.
const along = (camera: Camera, x: number, y: number, out: Vector3): Vector3 =>
  out.set(x, y, 0.5).unproject(camera).sub(camera.position).normalize().multiplyScalar(handDistance).add(camera.position);

// Where your hand sits: a plane facing the camera across the bottom of the view.
const handFrame = (camera: Camera): HandFrame => {
  const { at, left, right, across, up, forward } = scratch;

  camera.getWorldDirection(forward);
  along(camera, 0, handHeight, at);
  along(camera, -1, handHeight, left);
  along(camera, 1, handHeight, right);
  up.set(0, 1, 0).applyQuaternion(camera.quaternion);

  const width = left.distanceTo(right);

  across.copy(right).sub(left).normalize();

  return {
    origin: [at.x, at.y, at.z],
    right: [across.x, across.y, across.z],
    up: [up.x, up.y, up.z],
    out: [-forward.x, -forward.y, -forward.z],
    pitch: Math.PI / 2 - Math.asin(-forward.y),
    width,
  };
};

// Puts a card's group where its body is. Turning over near the felt, it rises by half its width,
// so it never cuts through the table.
const place = (group: Group, body: TableRoundBody): void => {
  const flip = Math.min(1, Math.max(0, body.flip.value));
  const card = group.children[0];
  const scale = Math.max(0.01, body.scale.value);

  group.position.set(body.x.value, body.y.value + Math.sin(Math.PI * flip) * cardSize.width * 0.5 * scale, body.z.value);
  group.rotation.set(body.pitch.value, body.yaw.value + body.shake.value * 0.12, body.roll.value, 'XYZ');
  group.scale.setScalar(scale);

  if (card) card.rotation.z = Math.PI * body.flip.value;
};

// Playable cards in your hand glow (spec D7), pulsing gently; the one you picked glows brightest.
// On your turn the ones you can't play are dimmed.
const shine = (group: Group, glow: number, dim: boolean): void => {
  const card = group.children[0] as Mesh | undefined;
  const halo = card?.children[0] as Mesh | undefined;
  const face = Array.isArray(card?.material) ? (card.material[3] as MeshStandardMaterial | undefined) : undefined;

  if (halo) {
    (halo.material as MeshBasicMaterial).opacity = glow;
    halo.visible = glow > 0.01;
  }

  face?.color.setScalar(dim ? 0.6 : 1);
};

// The round's frame loop, outside React (spec §8.3): where your hand is, every card's springs, and
// the meshes moved to match. Returns how each card's group signs up.
export const useRoomTableRoundFrames = (round: TableRoundStore, game: RoomGameStore): RoomTableRoundRegister => {
  const groups = useRef(new Map<string, Group>());
  const { camera } = useThree();

  useFrame(({ clock }, dt) => {
    const playable = game.hand.playableIds;
    const myTurn = game.match.isMyTurn;
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 3.2) * 0.2;
    const { hand, cards } = round;

    round.setFrame(handFrame(camera));
    round.step(dt, performance.now());

    groups.current.forEach((group, key) => {
      const body = cards.body(key);
      const inHand = cards.placeOf(key)?.kind === 'hand';

      if (!body) return;

      place(group, body);

      const glow = !inHand || !playable.has(key) ? 0 : hand.selectedId === key ? 1 : hand.hoveredId === key ? 0.9 : pulse;

      shine(group, glow, inHand && myTurn && !playable.has(key));
    });
  });

  return useCallback((key: string, group: Group | null) => {
    if (group) groups.current.set(key, group);
    else groups.current.delete(key);
  }, []);
};
