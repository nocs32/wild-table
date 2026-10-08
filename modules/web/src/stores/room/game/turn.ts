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
  actions: TurnActionView[];
}

// The fuse burns in a turn's last 8 seconds (spec D11).
const fuseSeconds = 8;

// What the turn is waiting for, in words, with the buttons for it when it's yours (spec D7): play
// or draw, play or keep a drawn card, pick a colour, answer a +2 or +4, or pick a hand to swap with.
// And the Last card! race, and how long is left.
export class RoomGameTurnStore {
  readonly #deps: RoomGameTurnDeps;

  constructor(deps: RoomGameTurnDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
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

    if (match.me?.standIn) return { title: t('round.standIn'), hint: t('round.standInHint'), isMine: false, actions: [] };

    return match.isMyTurn ? this.#myPrompt() : this.#theirPrompt();
  }

  // The bell's line while it's lit (spec §5.6): your own last card, catching someone, or calling early.
  get bellLine(): string {
    const { match, hand, t } = this.#deps;
    const race = match.round?.race ?? null;

    if (race === match.meId) return t('round.bell.mine');

    if (race !== null) return t('round.bell.catch', { name: match.nameOf(race) });

    return hand.canRing ? t('round.bell.early') : '';
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
        if (hand.isHeldBack) return mine(t('round.turn.raceBeat'), t('round.turn.raceBeatHint', { name: match.nameOf(round?.race ?? null) }));

        return mine(t('round.turn.play'), t(this.#deps.isTouch() ? 'round.turn.playHintTouch' : 'round.turn.playHint'));
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

    return { title: t('round.their.title', { name }), hint, isMine: false, actions: [] };
  }
}
