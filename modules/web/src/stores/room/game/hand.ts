import { playBlock, type PlayBlock, type PlayContext } from '@wild-table/engine';
import { isWild, raceBeatMs, type Card, type CardColour, type HandSnapshot, type HouseRules } from '@wild-table/protocol';
import { computed, makeAutoObservable } from 'mobx';
import type { Schedule } from '../../../services';
import type { Translate } from '../../locale';
import { cardLabel } from '../../rule-book/cards';
import type { TableSend } from '../types';
import type { RoomGameClockStore } from './clock';
import type { RoomGameMatchStore } from './match';

export interface RoomGameHandDeps {
  t: Translate;
  send: TableSend;
  match: RoomGameMatchStore;
  clock: RoomGameClockStore;
  rules: () => HouseRules;
  schedule: Schedule;
}

// Hovers go out at most this often (the table allows 10 a second, spec §10.5).
const hoverEveryMs = 120;

// Your own cards (D13), and what you may do with them now: the cards that glow are the ones the
// rules let you play, and any other says why not (spec D7). The table checks every move again.
export class RoomGameHandStore {
  cards: Card[] = [];
  drawnCardId: string | null = null;
  #hoverSent: number | null = null;
  #hoverNext: number | null = null;
  #hoverTimer: (() => void) | null = null;
  readonly #deps: RoomGameHandDeps;

  constructor(deps: RoomGameHandDeps) {
    this.#deps = deps;
    // Read every frame by the 3D hand: kept, not worked out again each time.
    makeAutoObservable(this, { playableIds: computed({ keepAlive: true }) }, { autoBind: true });
  }

  // What you can see of the round, for the rules' checks.
  get context(): PlayContext | null {
    const { match, rules } = this.#deps;
    const round = match.round;

    if (!round || !match.isSeated) return null;

    const { turn, step, top, colour, pendingDraw } = round;

    return { seat: match.meId, hand: this.cards, turn, step, drawnCardId: this.drawnCardId, top, colour, pendingDraw, rules: rules() };
  }

  // A Last card! race just opened and is still on: for a moment the table holds back every play but
  // the racer's (jump-ins too), and the next player's draw, so the race gets its chance (§5.6).
  get isBeatOn(): boolean {
    const { match, clock } = this.#deps;
    const opened = match.raceOpenedAt;

    return opened !== null && (match.round?.race ?? null) !== null && clock.now < opened + raceBeatMs;
  }

  get isHeldBack(): boolean {
    return this.isBeatOn && this.#deps.match.round?.race !== this.#deps.match.meId;
  }

  get playableIds(): ReadonlySet<string> {
    const context = this.context;

    return new Set(context && !this.isHeldBack ? this.cards.filter((card) => playBlock(context, card) === null).map((card) => card.id) : []);
  }

  get canDraw(): boolean {
    const step = this.#deps.match.round?.step;

    return this.#deps.match.isMyTurn && !this.isBeatOn && (step === 'play' || step === 'answer');
  }

  // The Last card! bell: anyone during a race, or you on your turn with two cards left, once (§5.6).
  get canRing(): boolean {
    const { match } = this.#deps;
    const round = match.round;

    if (!round || !match.isSeated) return false;

    return round.race !== null || (match.isMyTurn && round.step === 'play' && this.cards.length === 2 && round.earlyCall !== match.meId);
  }

  get count(): number {
    return this.cards.length;
  }

  find(cardId: string): Card | null {
    return this.cards.find((card) => card.id === cardId) ?? null;
  }

  canPlay(cardId: string): boolean {
    return this.playableIds.has(cardId);
  }

  // Why a card can't be played now, in a line (spec D7).
  whyNot(cardId: string): string {
    const context = this.context;
    const card = this.find(cardId);

    // It's left your hand (played, or passed on): nothing to say about it.
    if (!card) return '';

    const block = context ? playBlock(context, card) : 'notYourTurn';

    if (block === null && this.isHeldBack) return this.#deps.t('round.why.raceBeat', { name: this.#deps.match.nameOf(this.#deps.match.round?.race ?? null) });

    return block === null || !context ? '' : this.#blockText(block, context);
  }

  receive(hand: HandSnapshot | null): void {
    this.cards = hand?.cards ?? [];
    this.drawnCardId = hand?.drawnCardId ?? null;
  }

  // `strength`: how hard it was thrown, 0 to 1 (D25). False when the rules say no.
  play(cardId: string, strength: number): boolean {
    if (!this.canPlay(cardId)) return false;

    this.#deps.send('play', { cardId, strength: Math.min(1, Math.max(0, strength)) });

    return true;
  }

  draw(): void {
    if (this.canDraw) this.#deps.send('draw', {});
  }

  keep(): void {
    this.#deps.send('keep', {});
  }

  pickColour(colour: CardColour): void {
    this.#deps.send('pickColour', { colour });
  }

  challenge(): void {
    this.#deps.send('challenge', {});
  }

  take(): void {
    this.#deps.send('take', {});
  }

  swap(target: string): void {
    this.#deps.send('swap', { target });
  }

  ring(): void {
    if (this.canRing) this.#deps.send('bell', {});
  }

  // Your pointer over a card (its place in the hand) or off the hand: others see a card back lift
  // (spec §8). Sent at most every 120 ms, the latest one last.
  hover(index: number | null): void {
    this.#hoverNext = index;

    if (this.#hoverTimer || index === this.#hoverSent) return;

    this.#sendHover();
    this.#hoverTimer = this.#deps.schedule(() => this.#hoverDone(), hoverEveryMs);
  }

  #hoverDone(): void {
    this.#hoverTimer = null;

    if (this.#hoverNext !== this.#hoverSent) this.hover(this.#hoverNext);
  }

  #sendHover(): void {
    this.#hoverSent = this.#hoverNext;

    if (this.#deps.match.round) this.#deps.send('hover', { index: this.#hoverSent });
  }

  #blockText(block: PlayBlock, context: PlayContext): string {
    const { t, match } = this.#deps;

    switch (block) {
      case 'notYourTurn':
        return context.rules.jumpIn ? t('round.why.jumpIn', { name: match.nameOf(context.turn) }) : t('round.why.notYourTurn', { name: match.nameOf(context.turn) });
      case 'noMatch':
        return this.#noMatchText(context);
      case 'notDrawn':
        return t('round.why.notDrawn');
      case 'notNow':
        return this.#notNowText(context);
    }
  }

  // Your turn is at another step: answer the +2 or +4, or pick a colour or a hand first.
  #notNowText({ step, top, pendingDraw }: PlayContext): string {
    const { t } = this.#deps;

    if (step === 'swap') return t('round.why.swap');

    if (step !== 'answer') return t('round.why.pickColour');

    return t(top.kind === 'draw2' ? 'round.why.answer2' : 'round.why.answer4', { count: pendingDraw });
  }

  // "It doesn't fit on the Red 7: play red, a 7, or a Wild."
  #noMatchText({ top, colour }: PlayContext): string {
    const { t } = this.#deps;
    const values = { top: cardLabel(top, t), colour: t(`cards.colourNames.${colour}`) };

    if (isWild(top)) return t('round.why.noMatchWild', values);

    const same = top.kind === 'number' ? t('round.why.sameNumber', { value: top.value }) : t(`round.why.same.${top.kind}`);

    return t('round.why.noMatch', { ...values, same });
  }
}
