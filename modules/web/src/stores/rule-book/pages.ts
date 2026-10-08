import { cardPoints, checkPlay, handPoints, ruleBookExamples, type PlayExample } from '@wild-table/engine';
import { houseRules, type CardFace, type HouseRule, type HouseRules } from '@wild-table/protocol';
import { cardView, fitNote, type CardContext, type CardView, type MarkedCardView } from './cards';

// What the rule book's pages show that has to be worked out: real cards with the engine's ✅ and
// ❌, the scores added up, and this table's own settings. The rest of each page is plain text that
// the page reads straight from the translations.

export interface PageContext extends CardContext {
  rules: HouseRules;
  targetScore: number;
  handSize: number;
  isTouch: boolean;
}

export interface MarkedExample {
  top: CardView;
  hand: MarkedCardView[];
}

export const markExample = ({ top, hand }: PlayExample, context: PageContext): MarkedExample => ({
  top: cardView(top.card, context),
  hand: hand.map((face, index) => {
    const result = checkPlay(face, top, hand, context.rules);

    return { ...cardView(face, context, `${index}`), fits: result.fits, note: fitNote(result, top, context.t) };
  }),
});

export interface GoalPage {
  steps: string[];
  hand: CardView[];
}

export const goalPage = (context: PageContext): GoalPage => {
  const { t } = context;

  return {
    steps: [t('book.goal.deal', { count: context.handSize }), t('book.goal.turns'), t('book.goal.lastCard'), t('book.goal.win'), t('book.goal.match', { count: context.targetScore })],
    hand: ruleBookExamples.goal.map((face, index) => cardView(face, context, `${index}`)),
  };
};

export interface SpecialView {
  card: CardView;
  name: string;
  does: string;
  example: string;
}

type SpecialKind = 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

const specialKind = (face: CardFace): SpecialKind | null => (face.kind === 'number' ? null : face.kind);

// What a special card does, for the "Try it" lines on page 3; nothing for a number card.
export const specialEffect = (face: CardFace, context: Pick<PageContext, 't'>): string => {
  const kind = specialKind(face);

  return kind ? context.t(`book.specials.${kind}.does`) : '';
};

export const specialsPage = (context: PageContext): SpecialView[] =>
  ruleBookExamples.specials.flatMap((face) => {
    const kind = specialKind(face);

    if (!kind) return [];

    const { t } = context;

    return [{ card: cardView(face, context), name: t(`book.specials.${kind}.name`), does: t(`book.specials.${kind}.does`), example: t(`book.specials.${kind}.example`) }];
  });

export interface Wild4Page {
  fair: MarkedExample;
  bluff: MarkedExample;
}

export const wild4Page = (context: PageContext): Wild4Page => {
  // Page 4 explains the rule as it stands without the "+4 any time" house rule.
  const strict = { ...context, rules: { ...context.rules, wild4AnyTime: false } };

  return { fair: markExample(ruleBookExamples.fairWild4, strict), bluff: markExample(ruleBookExamples.bluffWild4, strict) };
};

export interface ScoredCardView extends CardView {
  points: number;
}

export interface ScoringPage {
  values: ScoredCardView[];
  hands: Array<{ name: string; cards: ScoredCardView[]; total: number }>;
  total: number;
}

const scored = (face: CardFace, context: PageContext, key: string): ScoredCardView => ({ ...cardView(face, context, key), points: cardPoints(face) });

// The other players at the example table.
const exampleNames = ['bo', 'cy', 'dee'] as const;

export const scoringPage = (context: PageContext): ScoringPage => ({
  values: ruleBookExamples.values.map((face, index) => scored(face, context, `${index}`)),
  hands: ruleBookExamples.scoring.map((hand, row) => ({
    name: context.t(`book.names.${exampleNames[row] ?? 'bo'}`),
    cards: hand.map((face, index) => scored(face, context, `${row}-${index}`)),
    total: handPoints(hand),
  })),
  total: ruleBookExamples.scoring.reduce((sum, hand) => sum + handPoints(hand), 0),
});

export interface HouseRuleEntry {
  rule: HouseRule;
  name: string;
  detail: string;
  cards: CardView[];
  on: boolean;
}

export const houseRulesPage = (context: PageContext): HouseRuleEntry[] =>
  houseRules.map((rule) => ({
    rule,
    name: context.t(`houseRules.${rule}.name`),
    detail: context.t(`book.houseRules.${rule}`),
    cards: ruleBookExamples.houseRules[rule].map((face, index) => cardView(face, context, `${rule}-${index}`)),
    on: context.rules[rule],
  }));

export const howToKinds = ['drag', 'throw', 'click', 'draw'] as const;

export type HowToKind = (typeof howToKinds)[number];

export interface HowToView {
  kind: HowToKind;
  title: string;
  text: string;
}

// Mouse or touch: the same four ways, in the words for this device.
export const howToPage = ({ t, isTouch }: PageContext): HowToView[] =>
  howToKinds.map((kind) => ({ kind, title: t(`book.howTo.${kind}.${isTouch ? 'touchTitle' : 'title'}`), text: t(`book.howTo.${kind}.${isTouch ? 'touch' : 'mouse'}`) }));

// Page 8's little table: a hand, the pile and the deck, for the looping how-tos.
export interface HowToScene {
  hand: CardView[];
  pile: CardView;
  back: string | null;
}

export const howToScene = (context: PageContext): HowToScene => {
  const { top, hand } = ruleBookExamples.turnTry;

  return {
    hand: hand.slice(0, 3).map((face, index) => cardView(face, context, `${index}`)),
    pile: cardView(top.card, context),
    back: context.art.backUrl(),
  };
};

// Page 5: the one card left in a hand.
export const lastCardView = (context: PageContext): CardView => cardView(ruleBookExamples.goal[2] ?? { kind: 'wild' }, context);
