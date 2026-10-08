import { cardColours, type CardColour } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { RoomGameClockStore } from './clock';
import type { RoomGameHandStore } from './hand';
import type { RoomGameMatchStore } from './match';

export interface RoomGameTurnDeps {
  t: Translate;
  match: RoomGameMatchStore;
  hand: RoomGameHandStore;
  clock: RoomGameClockStore;
  // Can you challenge the +4 on you? Not with "+4 any time" (spec §5.7).
  canChallenge: () => boolean;
  // Touch screens tap where a mouse clicks.
  isTouch: () => boolean;
}

// A button under the turn's prompt.
export interface TurnActionView {
  key: string;
  label: string;
  tone: 'primary' | 'secondary' | CardColour;
  run: () => void;
}

export interface TurnPromptView {
  title: string;
  hint: string;
  // It's you who has to do something.
  isMine: boolean;
  // Someone else is just taking their turn: on a phone, the title alone is enough.
  isBrief?: boolean;
  actions: TurnActionView[];
}

// The fuse burns in a turn's last 8 seconds (spec D11).
const fuseSeconds = 8;

// What the turn is waiting for, in words, with the buttons for it when it's yours (spec D7): play
// or draw, play or keep a drawn card, pick a colour, answer a +2 or +4, or pick a hand to swap with.
// And what the Last card! bell does now, and how long is left.
export class RoomGameTurnStore {
  // How many times your turn has come round: each time, "Your turn!" pops up over the table.
  announced = 0;
  readonly #deps: RoomGameTurnDeps;

  constructor(deps: RoomGameTurnDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // It's you the table is waiting for: the edges of the view glow until you've played.
  get isMine(): boolean {
    return this.prompt?.isMine ?? false;
  }

  get announcement(): string {
    return this.#deps.t('round.yourTurn');
  }

  announce(): void {
    this.announced += 1;
  }

  get secondsLeft(): number {
    return this.#deps.clock.secondsUntil(this.#deps.match.round?.endsAt ?? null);
  }

  // From 1 (8 seconds left) down to 0, while the fuse burns; null otherwise.
  get fuse(): number | null {
    const round = this.#deps.match.round;

    if (!round) return null;

    const left = (round.endsAt - this.#deps.clock.now) / 1000;

    return left <= fuseSeconds ? Math.max(0, left / fuseSeconds) : null;
  }

  // Your fuse is burning: your turn, in its last 8 seconds.
  get isBurning(): boolean {
    return this.#deps.match.isMyTurn && this.fuse !== null;
  }

  get secondsLabel(): string {
    return this.#deps.t('round.secondsLeft', { count: this.secondsLeft });
  }

  get prompt(): TurnPromptView | null {
    const { match, t } = this.#deps;
    const round = match.round;

    if (!round) return null;

    if (!match.isSeated) return { title: t('round.watching'), hint: t('round.watchingHint'), isMine: false, actions: [] };

    if (match.me?.standIn) return this.#standInPrompt();

    return match.isMyTurn ? this.#myPrompt() : this.#theirPrompt();
  }

  // What the Last card! bell does right now, in a line (spec §5.6): hit it on your turn to make
  // whoever's on one card draw 2, or wait for your turn; or watch out, you're the one on one card.
  get bellLine(): string {
    const { match, hand, t } = this.#deps;
    const names = this.#names(match.bellTargets.map((seat) => seat.name));

    if (hand.canRing) return t('round.bell.ready', { names });

    if (match.bellTargets.length > 0 && hand.hasRung) return t('round.bell.used');

    if (match.bellTargets.length > 0) return t('round.bell.wait', { names });

    return match.me?.isOnLastCard ? t('round.bell.mine') : '';
  }

  // "Ace", "Ace and Chip", "Ace, Chip and Dice".
  #names(names: readonly string[]): string {
    const last = names.at(-1) ?? '';

    return names.length < 2 ? last : `${names.slice(0, -1).join(', ')}${this.#deps.t('round.bell.and')}${last}`;
  }

  // A bot is playing for you. When your turn comes, it waits a few seconds before it moves: it's
  // your turn as ever ("Your turn!", the glowing edges, the step's buttons), and any move of your
  // own takes your seat back. Once the bot has started your turn, it's the bot's.
  #standInPrompt(): TurnPromptView {
    const { t, match } = this.#deps;
    const step = match.round?.step;

    if (match.isMyTurn && (step === 'play' || step === 'answer')) return { ...this.#myPrompt(), title: t('round.standInTurn'), hint: t('round.standInTurnHint') };

    return { title: t('round.standIn'), hint: t('round.standInHint'), isMine: false, actions: [] };
  }

  #myPrompt(): TurnPromptView {
    const { t, match, hand } = this.#deps;
    const round = match.round;
    const mine = (title: string, hint: string, actions: TurnActionView[] = []): TurnPromptView => ({ title, hint, isMine: true, actions });

    switch (round?.step) {
      case 'drawn':
        return mine(t('round.turn.drawn'), t('round.turn.drawnHint'), [
          { key: 'play', label: t('round.actions.playDrawn'), tone: 'primary', run: () => hand.play(hand.drawnCardId ?? '', 0.5) },
          { key: 'keep', label: t('round.actions.keep'), tone: 'secondary', run: hand.keep },
        ]);
      case 'pickColour':
        return mine(t('round.turn.pickColour'), t('round.turn.pickColourHint'), this.#colourActions());
      case 'answer':
        return this.#answerPrompt();
      case 'swap':
        return mine(t('round.turn.swap'), t('round.turn.swapHint'), this.#swapActions());
      default:
        return mine(t('round.turn.play'), this.#playHint(), this.#bellActions());
    }
  }

  // Hit by a +2 (with stacking) or a +4: take the cards, stack one of your own, or challenge (§5.5).
  #answerPrompt(): TurnPromptView {
    const { t, match, hand, canChallenge } = this.#deps;
    const round = match.round;
    const count = round?.pendingDraw ?? 0;
    const take: TurnActionView = { key: 'take', label: t('round.actions.take', { count }), tone: 'secondary', run: hand.take };

    if (round?.top.kind !== 'wild4') return { title: t('round.turn.hit2'), hint: t('round.turn.hit2Hint', { count }), isMine: true, actions: [take] };

    // The colour in play the +4 went down on: did they hold any of it?
    const colour = t(`cards.colourNames.${round.challengeColour ?? round.colour}`);
    const hint = canChallenge() ? t('round.turn.hit4Hint', { count, colour, penalty: count + 2 }) : t('round.turn.hit4NoChallenge', { count });
    const challenge: TurnActionView = { key: 'challenge', label: t('round.actions.challenge'), tone: 'primary', run: hand.challenge };

    return { title: t('round.turn.hit4'), hint, isMine: true, actions: canChallenge() ? [challenge, take] : [take] };
  }

  // How to play, and when the bell is yours to hit, what it does (spec D7).
  #playHint(): string {
    const { t, hand, isTouch } = this.#deps;
    const hint = t(isTouch() ? 'round.turn.playHintTouch' : 'round.turn.playHint');

    return hand.canRing ? `${hint} ${this.bellLine}` : hint;
  }

  // Someone else is down to one card: the bell, as a button too (spec §5.6).
  #bellActions(): TurnActionView[] {
    const { t, hand } = this.#deps;

    return hand.canRing ? [{ key: 'bell', label: t('round.actions.bell'), tone: 'secondary', run: hand.ring }] : [];
  }

  #colourActions(): TurnActionView[] {
    const { t, hand } = this.#deps;

    return cardColours.map((colour) => ({ key: colour, label: t(`cards.colours.${colour}`), tone: colour, run: () => hand.pickColour(colour) }));
  }

  #swapActions(): TurnActionView[] {
    const { t, match, hand } = this.#deps;

    return match.others.map((seat) => ({ key: seat.id, label: t('round.actions.swapWith', { name: seat.name, count: seat.cards }), tone: 'secondary', run: () => hand.swap(seat.id) }));
  }

  #theirPrompt(): TurnPromptView {
    const { t, match } = this.#deps;
    const round = match.round;
    const name = match.turnSeat?.name ?? '';
    const step = round?.step ?? 'play';
    const hint = step === 'answer' ? t(round?.top.kind === 'wild4' ? 'round.their.hit4' : 'round.their.hit2', { count: round?.pendingDraw ?? 0 }) : t(`round.their.${step}`);

    return { title: t('round.their.title', { name }), hint, isMine: false, isBrief: true, actions: [] };
  }
}
