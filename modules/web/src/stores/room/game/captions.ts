import { isWild, type Card, type HouseRules, type PlayEvent, type TablePeekEvent } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../../services';
import type { ArtStore } from '../../art';
import type { Translate } from '../../locale';
import { cardView, type CardView } from '../../rule-book/cards';
import type { RuleBookPage } from '../../rule-book';
import type { RoomGameMatchStore } from './match';

export interface RoomGameCaptionsDeps {
  t: Translate;
  art: ArtStore;
  match: RoomGameMatchStore;
  schedule: Schedule;
  // Two seats: a Reverse works like a Skip (spec §5.4).
  seatCount: () => number;
  rules: () => HouseRules;
}

// A line over the table saying what just happened, with the rule book's page about it (More).
export interface CaptionView {
  id: number;
  text: string;
  page: RuleBookPage | null;
  // Cards to show with it: the hand you challenged.
  cards: CardView[];
  // A "why not" for your own card, rather than news from the table.
  isWhy: boolean;
}

const showMs = 5200;
const maxShown = 3;

// What a special card is called in the captions' "first time" lines.
type Special = 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4' | 'jumpIn' | 'seven' | 'zero';

// The game explains itself as it goes (spec D7): the first time each special card is played, a line
// says what it did; challenges, the Last card! bell and running out of time always get one; and a
// card you can't play says why. A few at a time, each for a few seconds.
export class RoomGameCaptionsStore {
  items: CaptionView[] = [];
  #seen = new Set<Special>();
  #next = 1;
  readonly #deps: RoomGameCaptionsDeps;

  constructor(deps: RoomGameCaptionsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  receive(events: readonly PlayEvent[]): void {
    events.forEach((event) => this.#explain(event));
  }

  // You challenged a +4: their hand, for you alone (spec §5.5).
  receivePeek({ seat, cards }: TablePeekEvent): void {
    const { t, art, match } = this.#deps;

    this.#show(t('round.captions.peek', { name: match.nameOf(seat) }), 'wild4', cards.map((card: Card) => cardView(card, { t, art }, card.id)));
  }

  why(text: string): void {
    if (text) this.#show(text, null, [], true);
  }

  dismiss(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
  }

  clear(): void {
    this.items = [];
  }

  #explain(event: PlayEvent): void {
    const { t, match } = this.#deps;
    const name = (seat: string | null): string => (seat === match.meId ? t('round.captions.you') : match.nameOf(seat));

    switch (event.type) {
      case 'played':
        return this.#firstTime(event, name(event.seat));
      case 'challenged':
        return this.#show(t(event.bluff ? 'round.captions.bluff' : 'round.captions.fair', { name: name(event.seat), against: name(event.against) }), 'wild4');
      case 'bell':
        return this.#bell(event, name);
      case 'timedOut':
        return event.seat === match.meId ? this.#show(t('round.captions.timedOut'), null) : undefined;
      case 'reshuffled':
        return this.#show(t('round.captions.reshuffled'), null);
      default:
        return undefined;
    }
  }

  #bell(event: Extract<PlayEvent, { type: 'bell' }>, name: (seat: string | null) => string): void {
    const { t } = this.#deps;
    const key = event.result === 'caught' ? 'round.captions.caught' : event.result === 'early' ? 'round.captions.early' : 'round.captions.safe';

    this.#show(t(key, { name: name(event.seat), caught: name(event.caught) }), 'lastCard');
  }

  // A special card's first appearance: what it does, in one line.
  #firstTime(event: Extract<PlayEvent, { type: 'played' }>, name: string): void {
    const special = this.#specialOf(event);

    if (!special || this.#seen.has(special)) return;

    this.#seen.add(special);

    const key = special === 'reverse' && this.#deps.seatCount() === 2 ? 'reverse2' : special;
    const page: RuleBookPage = special === 'jumpIn' || special === 'seven' || special === 'zero' ? 'houseRules' : special === 'wild4' ? 'wild4' : 'specials';

    this.#show(this.#deps.t(`round.captions.first.${key}`, { name }), page);
  }

  #specialOf({ card, jumpIn }: Extract<PlayEvent, { type: 'played' }>): Special | null {
    if (jumpIn) return 'jumpIn';

    if (isWild(card) || card.kind !== 'number') return card.kind;

    if (!this.#deps.rules().sevenZero) return null;

    return card.value === 7 ? 'seven' : card.value === 0 ? 'zero' : null;
  }

  #show(text: string, page: RuleBookPage | null, cards: CardView[] = [], isWhy = false): void {
    const id = this.#next++;

    this.items = [...this.items.filter((item) => !(isWhy && item.isWhy)), { id, text, page, cards, isWhy }].slice(-maxShown);
    this.#deps.schedule(() => this.dismiss(id), cards.length > 0 ? showMs * 2 : showMs);
  }
}
