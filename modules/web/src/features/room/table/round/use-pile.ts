import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group, Mesh, MeshBasicMaterial } from 'three';
import type { TableRoundStore } from '../../../../stores/table/round';
import { Spring } from '../../../../utils/spring';
import { glow as glowing, suitGlow } from '../palette';

export interface RoomTableRoundPileRefs {
  ring: RefObject<Group | null>;
  glow: RefObject<Mesh | null>;
  wave: RefObject<Mesh | null>;
}

// How long a slap's ring of air and a Wild's wave of colour last, in milliseconds.
const slapMs = 450;
const waveMs = 900;

// The middle of the table, every frame (spec §8.1, §8.2): the arrow ring turns slowly the way play
// goes, and spins round when a Reverse flips it; the glow of the colour in play breathes; a slap
// sends a ring of air out across the felt, harder for a harder throw; and a Wild sends a wave of
// its colour.
export const useRoomTableRoundPile = (round: TableRoundStore): RoomTableRoundPileRefs => {
  const ring = useRef<Group>(null);
  const glow = useRef<Mesh>(null);
  const wave = useRef<Mesh>(null);
  const speed = useRef(new Spring(0.25, 40, 9));

  useFrame(({ clock }, dt) => {
    const now = performance.now();
    const { effects, direction } = round;
    const spinning = now - effects.spinAt < 700;

    speed.current.target = direction * (spinning ? 6 : 0.25);
    speed.current.step(dt);

    if (ring.current) ring.current.rotation.y -= speed.current.value * dt;

    const tint = round.colour ? suitGlow[round.colour] : glowing.card;

    if (ring.current) ring.current.children.forEach((child) => ((child as Mesh).material as MeshBasicMaterial).color.copy(tint));

    if (glow.current) {
      const material = glow.current.material as MeshBasicMaterial;

      material.color.copy(tint);
      material.opacity = round.colour ? 0.16 + Math.sin(clock.elapsedTime * 1.6) * 0.04 : 0;
    }

    const slap = Math.min(1, (now - effects.slapAt) / slapMs);
    const washed = Math.min(1, (now - effects.waveAt) / waveMs);
    const shock = wave.current;

    if (!shock) return;

    const isSlap = slap < 1 && effects.slapImpact > 0.05;

    shock.visible = isSlap || washed < 1;
    shock.scale.setScalar(isSlap ? 0.3 + slap * (0.8 + effects.slapImpact * 1.4) : 0.4 + washed * 3);
    (shock.material as MeshBasicMaterial).opacity = isSlap ? (1 - slap) * (0.25 + effects.slapImpact * 0.6) : (1 - washed) * 0.45;
    (shock.material as MeshBasicMaterial).color.copy(isSlap ? glowing.card : tint);
  });

  return { ring, glow, wave };
};
