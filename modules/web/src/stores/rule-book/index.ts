import { ruleBookExamples } from '@wild-table/engine';
import type { HouseRule } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { DeviceService } from '../../services';
import type { ArtStore } from '../art';
import type { Translate } from '../locale';
import type { RoomGameSettingsStore } from '../room/game/settings';
import type { CardView } from './cards';
import {
  goalPage,
  houseRulesPage,
  howToPage,
  howToScene,
  lastCardView,
  markExample,
  scoringPage,
  specialEffect,
  specialsPage,
  wild4Page,
  type GoalPage,
  type HouseRuleEntry,
  type HowToScene,
  type HowToView,
  type MarkedExample,
  type PageContext,
  type ScoringPage,
  type SpecialView,
  type Wild4Page,
} from './pages';
import { RuleBookTryStore } from './try';

export const ruleBookPages = ['goal', 'turn', 'specials', 'wild4', 'lastCard', 'scoring', 'houseRules', 'howTo'] as const;

export type RuleBookPage = (typeof ruleBookPages)[number];

// closed ⇄ open. It never pauses the game (spec §9.1).
export type RuleBookState = 'closed' | 'open';

// A request to bring a section (or one house rule in it) into view: from a tab, or from opening the
// book at a place. `count` makes each request new, even for the same place twice.
export interface RuleBookJump {
  page: RuleBookPage;
  rule: HouseRule | null;
  smooth: boolean;
  count: number;
}

export interface RuleBookTab {
  page: RuleBookPage;
  number: number;
  label: string;
  isCurrent: boolean;
}

export interface RuleBookDeps {
  t: Translate;
  art: ArtStore;
  // This table's settings: the target score, the hand size and the house rules switched on.
  settings: RoomGameSettingsStore;
  device: DeviceService;
}

// The rule book (spec D27, §9.1): the game's own printed leaflet, one click away from the top bar,
// the lobby, the leaflet on the table and the house rules' tent cards. One long page to scroll; the
// tabs down the side follow where you are, and take you to a section.
export class RuleBookStore {
  state: RuleBookState = 'closed';
  // The section in view.
  page: RuleBookPage = 'goal';
  // The house rule to point at, when the book was opened for it.
  highlighted: HouseRule | null = null;
  jump: RuleBookJump | null = null;
  readonly turnTry: RuleBookTryStore;
  readonly specialsTry: RuleBookTryStore;
  readonly #deps: RuleBookDeps;

  constructor(deps: RuleBookDeps) {
    const rules = (): RuleBookDeps['settings']['houseRules'] => deps.settings.houseRules;

    this.#deps = deps;
    this.turnTry = new RuleBookTryStore({ t: deps.t, art: deps.art, example: ruleBookExamples.turnTry, rules, effect: () => '' });
    this.specialsTry = new RuleBookTryStore({ t: deps.t, art: deps.art, example: ruleBookExamples.specialsTry, rules, effect: (face) => specialEffect(face, deps) });
    makeAutoObservable(this, { turnTry: false, specialsTry: false }, { autoBind: true });
  }

  get isOpen(): boolean {
    return this.state === 'open';
  }

  get tabs(): RuleBookTab[] {
    return ruleBookPages.map((page, index) => ({ page, number: index + 1, label: this.#deps.t(`book.pages.${page}`), isCurrent: page === this.page }));
  }

  get goal(): GoalPage {
    return goalPage(this.#context);
  }

  get turn(): MarkedExample {
    return markExample(ruleBookExamples.turn, this.#context);
  }

  get specials(): SpecialView[] {
    return specialsPage(this.#context);
  }

  get wild4(): Wild4Page {
    return wild4Page(this.#context);
  }

  get lastCard(): CardView {
    return lastCardView(this.#context);
  }

  get scoring(): ScoringPage {
    return scoringPage(this.#context);
  }

  get houseRules(): HouseRuleEntry[] {
    return houseRulesPage(this.#context);
  }

  get howTo(): HowToView[] {
    return howToPage(this.#context);
  }

  get howToScene(): HowToScene {
    return howToScene(this.#context);
  }

  get targetScore(): number {
    return this.#deps.settings.targetScore;
  }

  // Opens at the start, or straight at a section.
  open(page: RuleBookPage = 'goal'): void {
    this.state = 'open';
    this.#jumpTo(page, null, false);
  }

  // From a house rule's tent card or its (?) on the settings card: straight to that rule.
  openHouseRule(rule: HouseRule): void {
    this.state = 'open';
    this.#jumpTo('houseRules', rule, false);
  }

  close(): void {
    this.state = 'closed';
  }

  // Ark's dialog reports Escape, the backdrop and the close button here.
  setOpen(open: boolean): void {
    if (open) this.open();
    else this.close();
  }

  // A tab: scrolls to its section.
  goTo(page: RuleBookPage): void {
    this.#jumpTo(page, null, true);
  }

  // Scrolling brought another section into view.
  see(page: RuleBookPage): void {
    this.page = page;
  }

  #jumpTo(page: RuleBookPage, rule: HouseRule | null, smooth: boolean): void {
    this.page = page;
    this.highlighted = rule;
    this.jump = { page, rule, smooth, count: (this.jump?.count ?? 0) + 1 };
  }

  get #context(): PageContext {
    const { t, art, settings, device } = this.#deps;

    return { t, art, rules: settings.houseRules, targetScore: settings.targetScore, handSize: settings.handSize, isTouch: device.isTouch() };
  }
}
