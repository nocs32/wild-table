import { defaultGameSettings, houseRules, type GameSettings } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import type { BotLevel } from '../bots.js';
import { createRandom } from '../random.js';
import { simulateMatch } from './simulate.js';

// Random settings: 2 to 6 seats, any house rules, any hand size, a short target to keep it quick.
const randomSettings = (random: () => number): GameSettings => ({
  ...defaultGameSettings,
  targetScore: 100 + Math.floor(random() * 3) * 50,
  handSize: 5 + Math.floor(random() * 6),
  houseRules: Object.fromEntries(houseRules.map((rule) => [rule, random() < 0.4])) as GameSettings['houseRules'],
});

const table = (count: number, level: (index: number) => BotLevel): Record<string, BotLevel> =>
  Object.fromEntries(Array.from({ length: count }, (_, index) => [`seat${index}`, level(index)]));

test('hundreds of bot matches with random settings: every one ends, and all 108 cards stay in play', () => {
  const random = createRandom(2026);

  Array.from({ length: 300 }, (_, index) => {
    const seats = 2 + (index % 5);
    const match = simulateMatch(table(seats, (seat) => (seat % 2 === 0 ? 'planner' : 'random')), randomSettings(random), random);

    expect(match.stalled).toBe(false);
    expect(match.allCardsKept).toBe(true);
    expect(match.rounds).toBeGreaterThan(0);
  });
});

test('the planning bot beats the random one', () => {
  const random = createRandom(7);

  const wins = Array.from({ length: 200 }, () => simulateMatch(table(4, (seat) => (seat < 2 ? 'planner' : 'random')), { ...defaultGameSettings, targetScore: 200 }, random)).filter(
    (match) => match.winner === 'seat0' || match.winner === 'seat1',
  ).length;

  expect(wins / 200).toBeGreaterThan(0.6);
});
