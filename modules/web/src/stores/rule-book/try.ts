import { checkPlay, faceKey, type PileTop, type PlayCheck, type PlayExample } from '@wild-table/engine';
import { isWild, type CardFace, type HouseRules } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import { cardLabel, cardView, fitNote, type CardContext, type CardView } from './cards';

export interface RuleBookTryDeps extends CardContext {
  example: PlayExample;
  rules: () => HouseRules;
  // What a special card does, added after "it fits" (page 3), or nothing (page 2).
  effect: (card: CardFace) => string;
}

// A card in the try-it hand: `id` tells the cards apart, since the same face can be there twice.
export interface TryCardView extends CardView {
  id: string;
  // Just turned down: it shakes its head. `key` changes with each refusal, so it shakes again.
  shaking: boolean;
}

interface TryCard {
  id: string;
  face: CardFace;
}

// What happened to the last card tried.
interface TryOutcome {
  id: string;
  face: CardFace;
  result: PlayCheck;
  // The pile before it: what the card was checked against.
  under: PileTop;
}

// idle → played | refused (each try) → … → idle (reset).
export type RuleBookTryState = 'idle' | 'played' | 'refused';

const toTryCards = (hand: readonly CardFace[]): TryCard[] => hand.map((face, index) => ({ id: `${faceKey(face)}-${index}`, face }));

// "Try it" (spec §9.1): play the example hand onto the example pile. Each card says whether it
// fits and why, using the game's own rules; a card that fits lands on the pile.
export class RuleBookTryStore {
  state: RuleBookTryState = 'idle';
  top: PileTop;
  hand: TryCard[];
  outcome: TryOutcome | null = null;
  // Bumped on each refusal, so the same card can shake again.
  shakes = 0;
  readonly #deps: RuleBookTryDeps;

  constructor(deps: RuleBookTryDeps) {
    this.#deps = deps;
    this.top = deps.example.top;
    this.hand = toTryCards(deps.example.hand);
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get topCard(): CardView {
    return cardView(this.top.card, this.#deps);
  }

  get handCards(): TryCardView[] {
    return this.hand.map(({ id, face }) => {
      const shaking = this.refusedId === id;

      return { ...cardView(face, this.#deps), id, key: shaking ? `${id}-${this.shakes}` : id, shaking };
    });
  }

  // The card that just got turned down, shaking its head.
  get refusedId(): string | null {
    return this.state === 'refused' ? (this.outcome?.id ?? null) : null;
  }

  // The line under the example: what to do, or what the last card did.
  get message(): string {
    const { t } = this.#deps;
    const outcome = this.outcome;

    if (!outcome) return t('book.try.prompt');

    const name = cardLabel(outcome.face, t);
    const why = fitNote(outcome.result, outcome.under, t);

    if (!outcome.result.fits) return t('book.try.refused', { card: name, why, top: cardLabel(outcome.under.card, t) });

    return [t('book.try.played', { card: name, why }), this.#deps.effect(outcome.face)].filter(Boolean).join(' ');
  }

  get isEmpty(): boolean {
    return this.hand.length === 0;
  }

  get canReset(): boolean {
    return this.outcome !== null;
  }

  play(id: string): void {
    const card = this.hand.find((candidate) => candidate.id === id);

    if (!card) return;

    const result = checkPlay(card.face, this.top, this.hand.map((other) => other.face), this.#deps.rules());

    this.outcome = { id, face: card.face, result, under: this.top };

    if (!result.fits) {
      this.state = 'refused';
      this.shakes++;

      return;
    }

    this.state = 'played';
    this.hand = this.hand.filter((other) => other.id !== id);
    // A wild keeps the colour in play here: in the game, you'd pick one.
    this.top = { card: card.face, colour: isWild(card.face) ? this.top.colour : card.face.colour };
  }

  reset(): void {
    this.state = 'idle';
    this.top = this.#deps.example.top;
    this.hand = toTryCards(this.#deps.example.hand);
    this.outcome = null;
  }
}
