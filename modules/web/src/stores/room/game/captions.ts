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

type FirstLine = Special | 'reverse2' | 'wild4Free';

// The lines that name who played: they have a "you" version.
const namedSpecials = ['reverse2', 'wild', 'wild4', 'wild4Free', 'jumpIn', 'seven'] as const;

type NamedSpecial = (typeof namedSpecials)[number];

const isNamed = (line: FirstLine): line is NamedSpecial => (namedSpecials as readonly FirstLine[]).includes(line);

// The game explains itself as it goes (spec D7): the first time each special card is played, a line
// says what it did; challenges, the Last card! bell and running out of time always get one; and a
// card you can't play says why. A few at a time, each for a few seconds.
export class RoomGameCaptionsStore {
  items: CaptionView[] = [];
  #seen = new Set<Special>();
  #bellIntroduced = false;
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

  // A line from the room itself (the graphics got lighter, say).
  note(text: string): void {
    this.#show(text, null);
  }

  dismiss(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
  }

  clear(): void {
    this.items = [];
  }

  #explain(event: PlayEvent): void {
    const { t, match } = this.#deps;

    switch (event.type) {
      case 'played':
        return this.#firstTime(event);
      case 'challenged':
        return this.#challenged(event);
      case 'bell':
        return this.#bell(event);
      case 'timedOut':
        return event.seat === match.meId ? this.#show(t(`round.captions.timedOut.${event.step}`), null) : undefined;
      case 'dealt':
        return this.#opening(event.first);
      case 'reshuffled':
        return this.#show(t('round.captions.reshuffled'), null);
      default:
        return undefined;
    }
  }

  // A special card turned up to start the round: what it does to the first player.
  #opening(first: Card): void {
    if (first.kind === 'number' || first.kind === 'wild4') return;

    this.#show(this.#deps.t(`round.captions.opening.${first.kind}`), 'specials');
  }

  // Lines about you say "you", in a sentence of their own, so both languages read right.
  #challenged({ seat, against, bluff }: Extract<PlayEvent, { type: 'challenged' }>): void {
    const { t, match } = this.#deps;
    const me = match.meId;
    const fair = seat === me ? 'fairYou' : against === me ? 'fairAgainstYou' : 'fair';
    const key = bluff ? (against === me ? 'bluffYou' : 'bluff') : fair;

    this.#show(t(`round.captions.${key}`, { name: match.nameOf(seat), against: match.nameOf(against) }), 'wild4');
  }

  // Someone hit the Last card! bell (§5.6): who it hit, and what it cost, said to you where it's you.
  #bell({ seat, hit }: Extract<PlayEvent, { type: 'bell' }>): void {
    const { t, match } = this.#deps;
    const me = match.meId;
    const others = hit.filter((target) => target !== me).map((target) => match.nameOf(target));
    const values = { name: match.nameOf(seat), targets: this.#names(hit.map((target) => match.nameOf(target))), others: this.#names(others) };
    const many = hit.length > 1 ? 'Many' : '';
    const key = seat === me ? (`bellByYou${many}` as const) : !hit.includes(me) ? (`bell${many}` as const) : others.length > 0 ? 'bellOnYouAnd' : 'bellOnYou';

    this.#show(t(`round.captions.${key}`, values), 'lastCard');
  }

  // The first time anyone's down to one card: what the bell does (spec D7).
  introduceBell(): void {
    if (this.#bellIntroduced) return;

    this.#bellIntroduced = true;
    this.#show(this.#deps.t('round.captions.firstBell'), 'lastCard');
  }

  // "Ace", "Ace and Chip", "Ace, Chip and Dice".
  #names(names: readonly string[]): string {
    const last = names.at(-1) ?? '';

    return names.length < 2 ? last : `${names.slice(0, -1).join(', ')}${this.#deps.t('round.bell.and')}${last}`;
  }

  // A special card's first appearance: what it does, in one line.
  #firstTime(event: Extract<PlayEvent, { type: 'played' }>): void {
    const { match, seatCount, t } = this.#deps;
    const special = this.#specialOf(event);

    if (!special || this.#seen.has(special)) return;

    this.#seen.add(special);

    const plain = this.#firstLine(special, seatCount());
    const key = event.seat === match.meId && isNamed(plain) ? (`${plain}You` as const) : plain;
    const page: RuleBookPage = special === 'jumpIn' || special === 'seven' || special === 'zero' ? 'houseRules' : special === 'wild4' ? 'wild4' : 'specials';

    this.#show(t(`round.captions.first.${key}`, { name: match.nameOf(event.seat) }), page);
  }

  // Reverse with two players works like a Skip; with "+4 any time" a +4 can't be challenged.
  #firstLine(special: Special, seats: number): FirstLine {
    if (special === 'reverse' && seats === 2) return 'reverse2';

    return special === 'wild4' && this.#deps.rules().wild4AnyTime ? 'wild4Free' : special;
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
