import type { ReactElement } from 'react';
import type { PlayerColor, PresenceStatus } from '../stores/room/types';
import { AvatarBot, AvatarPresence, AvatarRoot } from './styled-components';

interface AvatarProps {
  initial: string;
  color: PlayerColor;
  size: 'sm' | 'md' | 'lg';
  label?: string;
  presence?: PresenceStatus;
  ring?: boolean;
  // Bots wear a 🤖 (spec §6).
  bot?: boolean;
}

// A poker chip in the player's colour with their initial, an optional presence dot, and a 🤖 for bots.
export function Avatar({ initial, color, size, label, presence, ring = false, bot = false }: AvatarProps): ReactElement {
  return (
    <AvatarRoot tone={color} size={size} ring={ring} role="img" aria-label={label} title={label}>
      {initial}
      {presence && <AvatarPresence status={presence} />}
      {bot && <AvatarBot aria-hidden>🤖</AvatarBot>}
    </AvatarRoot>
  );
}
