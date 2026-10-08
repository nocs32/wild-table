import { defaultGameSettings } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { ruleBookExamples, type PlayExample } from './examples.js';
import { checkPlay } from './plays.js';
import { handPoints } from './scoring.js';

// What the rule book shows next to each card: ✅ with the reason, or ❌.
const marks = ({ top, hand }: PlayExample): string[] =>
  hand.map((card) => {
    const result = checkPlay(card, top, hand, defaultGameSettings.houseRules);

    if (!result.fits) return '❌';

    return result.bluff ? '✅ bluff' : `✅ ${result.reason}`;
  });

test('page 2: what fits on a red 7', () => {
  expect(marks(ruleBookExamples.turn)).toEqual(['✅ sameColour', '✅ sameNumber', '✅ wild', '❌', '❌']);
});

test('page 2: the "Try it" hand has cards that fit and cards that don’t', () => {
  expect(marks(ruleBookExamples.turnTry)).toEqual(['✅ sameColour', '✅ sameNumber', '❌', '✅ wild', '❌']);
});

test('page 3: special cards on a yellow +2', () => {
  expect(marks(ruleBookExamples.specialsTry)).toEqual(['✅ sameSymbol', '✅ sameColour', '❌', '✅ wild', '✅ bluff']);
});

test('page 4: the same Wild +4, fair in one hand and a bluff in the other', () => {
  expect(marks(ruleBookExamples.fairWild4).at(-1)).toBe('✅ wild4');
  expect(marks(ruleBookExamples.bluffWild4).at(-1)).toBe('✅ bluff');
});

test('page 6: the leftover hands add up to 136', () => {
  const totals = ruleBookExamples.scoring.map(handPoints);

  expect(totals).toEqual([28, 53, 55]);
  expect(totals.reduce((sum, total) => sum + total, 0)).toBe(136);
});
