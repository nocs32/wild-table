import { handPoints } from '@wild-table/engine';
import { makeAutoObservable } from 'mobx';
import type { ArtStore } from '../../art';
import type { Translate } from '../../locale';
import { cardView, type CardView } from '../../rule-book/cards';
import type { TableSend } from '../types';
import type { RoomGameClockStore } from './clock';
import type { MatchSeatView, RoomGameMatchStore } from './match';

export interface RoomGameResultDeps {
  t: Translate;
  art: ArtStore;
  send: TableSend;
  match: RoomGameMatchStore;
  clock: RoomGameClockStore;
  targetScore: () => number;
}

// A seat in the round's scores: what was left in their hand, face up, and their total.
export interface ResultRowView {
  seat: MatchSeatView;
  isWinner: boolean;
  cards: CardView[];
  // What the cards left in their hand are worth to the winner.
  handLabel: string;
}

// A step of the podium (spec §4.4).
export interface PodiumPlaceView {
  seat: MatchSeatView;
  place: number;
  placeLabel: string;
}

const placeKeys = ['first', 'second', 'third'] as const;

// The end of a round (every hand face up, the points counted into the winner's score, the next
// round in 10 seconds) and the end of the match (the podium, then Play again).
export class RoomGameResultStore {
  readonly #deps: RoomGameResultDeps;

  constructor(deps: RoomGameResultDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get #result(): NonNullable<RoomGameMatchStore['snapshot']>['result'] {
    return this.#deps.match.snapshot?.result ?? null;
  }

  get winner(): MatchSeatView | null {
    return this.#deps.match.seat(this.#result?.winner ?? null);
  }

  get title(): string {
    const { t } = this.#deps;
    const winner = this.winner;

    return winner?.isMe ? t('round.over.youWin') : t('round.over.win', { name: winner?.name ?? '' });
  }

  get pointsLabel(): string {
    return this.#deps.t('round.over.points', { count: this.#result?.points ?? 0 });
  }

  get targetLabel(): string {
    return this.#deps.t('round.over.target', { count: this.#deps.targetScore() });
  }

  // The winner first, then everyone by score.
  get rows(): ResultRowView[] {
    const { t, art, match } = this.#deps;
    const hands = this.#result?.hands ?? {};
    const winnerId = this.#result?.winner;

    return [...match.standings]
      .sort((a, b) => Number(b.id === winnerId) - Number(a.id === winnerId))
      .map((seat) => {
        const cards = hands[seat.id] ?? [];

        return { seat, isWinner: seat.id === winnerId, cards: cards.map((card) => cardView(card, { t, art }, card.id)), handLabel: t('round.over.hand', { count: handPoints(cards) }) };
      });
  }

  get nextLabel(): string {
    return this.#deps.t('round.over.next', { count: this.#deps.clock.secondsUntil(this.#deps.match.snapshot?.nextAt ?? null) });
  }

  get champion(): MatchSeatView | null {
    return this.#deps.match.seat(this.#deps.match.snapshot?.champion ?? null);
  }

  get championTitle(): string {
    const { t } = this.#deps;
    const champion = this.champion;

    return champion?.isMe ? t('round.podium.youWin') : t('round.podium.win', { name: champion?.name ?? '' });
  }

  // The top three, in the order they stand: second, first, third.
  get podium(): PodiumPlaceView[] {
    const places = this.#deps.match.standings.slice(0, 3).map((seat, index) => ({ seat, place: index + 1, placeLabel: this.#deps.t(`round.podium.${placeKeys[index] ?? 'third'}`) }));

    return [places[1], places[0], places[2]].filter((place): place is PodiumPlaceView => place !== undefined);
  }

  next(): void {
    this.#deps.send('nextRound', {});
  }

  playAgain(): void {
    this.#deps.send('playAgain', {});
  }
}
