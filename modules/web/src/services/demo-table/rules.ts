import { pickBotName } from '@wild-table/engine';
import { playerColors, type PlayerColor } from '@wild-table/protocol';
import type { DemoLanguage, DemoMember } from './types';

// The demo's sample players, standing in for people. Names and colours follow the same rules as
// the server's.
const sampleProfiles: ReadonlyArray<{ name: string; language: DemoLanguage }> = [
  { name: 'Nimble Finch', language: 'en' },
  { name: 'Тиха Рись', language: 'uk' },
  { name: 'Breezy Heron', language: 'en' },
  { name: 'Сонячна Видра', language: 'uk' },
  { name: 'Bold Badger', language: 'en' },
  { name: 'Весела Сова', language: 'uk' },
  { name: 'Lucky Newt', language: 'en' },
  { name: 'Хитрий Їжак', language: 'uk' },
  { name: 'Mellow Moth', language: 'en' },
  { name: 'Спритна Білка', language: 'uk' },
  { name: 'Jolly Wren', language: 'en' },
];

export const freeColor = (members: readonly DemoMember[]): PlayerColor =>
  playerColors.find((color) => !members.some((member) => member.color === color)) ?? 'indigo';

// The next sample player who isn't at the table yet.
export const nextSample = (members: readonly DemoMember[], createId: () => string): DemoMember | null => {
  const profile = sampleProfiles.find((candidate) => !members.some((member) => member.name === candidate.name));

  return profile ? { id: createId(), ...profile, color: freeColor(members), connected: true, bot: false, sample: true } : null;
};

// A bot, named the way the server names them.
export const newBot = (members: readonly DemoMember[], createId: () => string): DemoMember => ({
  id: `bot-${createId()}`,
  name: pickBotName(new Set(members.map((member) => member.name))),
  color: freeColor(members),
  connected: true,
  bot: true,
  sample: false,
  language: 'en',
});
