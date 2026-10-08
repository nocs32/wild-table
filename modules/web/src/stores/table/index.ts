import type { CardColour, HouseRule } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule, SoundCue, SoundsService } from '../../services';
import type { Translate } from '../locale';
import type { RoomGameStore } from '../room/game';
import { holdHeight, TableDeckStore } from './deck';
import { TableRoundStore } from './round';
import { roundHoldHeight } from './round/hand';

export interface TableDeps {
  t: Translate;
  random: () => number;
  schedule: Schedule;
  now: () => number;
  sounds: SoundsService;
  game: RoomGameStore;
}

// The things round the room to poke while you wait (spec §8.1): each wiggles when pointed at and
// does something silly when clicked.
export const tableProps = ['lamp', 'lava', 'boombox', 'pizza'] as const;

export type TableProp = (typeof tableProps)[number];

// What each prop sounds like when poked.
const propSounds: Record<TableProp, SoundCue> = { lamp: 'creak', lava: 'bubbles', boombox: 'button', pizza: 'box' };

// When a prop was last poked, and how many times.
export interface TablePoke {
  at: number;
  count: number;
}

// What the pointer is over on the table: in the lobby, the deck's cards, the leaflet and the tent
// cards; in a round, a card in your hand, the deck, the pile, the Last card! bell and the colour orbs.
export type TableHover =
  | { kind: 'card'; id: number }
  | { kind: 'leaflet' }
  | { kind: 'tent'; rule: HouseRule; name: string }
  | { kind: 'hand'; id: string; index: number }
  | { kind: 'roundDeck' }
  | { kind: 'pile' }
  | { kind: 'bell' }
  | { kind: 'orb'; colour: CardColour }
  | { kind: 'prop'; prop: TableProp };

const sameTarget = (one: TableHover, other: TableHover): boolean => {
  if (one.kind === 'card' && other.kind === 'card') return one.id === other.id;

  if (one.kind === 'hand' && other.kind === 'hand') return one.id === other.id;

  if (one.kind === 'tent' && other.kind === 'tent') return one.rule === other.rule;

  if (one.kind === 'prop' && other.kind === 'prop') return one.prop === other.prop;

  if (one.kind === 'orb' && other.kind === 'orb') return one.colour === other.colour;

  return one.kind === other.kind;
};

// What happens on the 3D table itself, in this browser: the deck to play with in the lobby, the
// round's cards, what the pointer is over (for the cursor and a tooltip saying what a click does,
// spec D7), and how far the lobby's side panels cover the table, so the camera frames what's left.
export class TableStore {
  readonly deck: TableDeckStore;
  readonly round: TableRoundStore;
  hovered: TableHover | null = null;
  // Pixels of the table covered by the lobby's cards on the left and on the right.
  insetLeft = 0;
  insetRight = 0;
  // Read every frame by the props' animations.
  readonly pokes = new Map<TableProp, TablePoke>();
  // How far the hanging lamp swings (radians), written every frame by the lamp: its light follows.
  readonly sway = { lamp: 0 };
  readonly #t: Translate;
  readonly #now: () => number;
  readonly #sounds: SoundsService;
  readonly #game: RoomGameStore;

  constructor(deps: TableDeps) {
    this.#t = deps.t;
    this.#game = deps.game;
    this.#now = deps.now;
    this.#sounds = deps.sounds;
    this.deck = new TableDeckStore(deps);
    this.round = new TableRoundStore({ game: deps.game, schedule: deps.schedule, sounds: deps.sounds });
    makeAutoObservable(this, { deck: false, round: false, pokes: false, sway: false }, { autoBind: true });
  }

  // In a round your hand covers this share of the bottom of the view: the table moves up out of its way.
  get bottomShare(): number {
    return this.round.isShown ? 0.12 : 0;
  }

  // Room left round the table in view: in a round the camera comes in close. At the podium it backs
  // off again, so the pinball machine scrolling the winner's name is in view.
  get cameraMargin(): number {
    if (this.isJackpot) return 1.8;

    return this.round.isShown ? 0.2 : 0.9;
  }

  // What the pinball machine's score display scrolls (spec §8.1): who won the round, or the match.
  // Empty: it shows the game's name.
  get pinballLine(): string {
    const { state, result } = this.#game;

    if (state === 'podium') return result.championTitle;

    return state === 'roundOver' ? `${result.title} ${result.pointsLabel}` : '';
  }

  // The match is won: the pinball machine goes off like a jackpot.
  get isJackpot(): boolean {
    return this.#game.state === 'podium' && !this.round.isReplaying;
  }

  // The height a held card floats at: the pointer is followed on that plane.
  get holdHeight(): number {
    return this.round.isShown ? roundHoldHeight : holdHeight;
  }

  get cursor(): string {
    const hovered = this.hovered;

    if (this.round.isShown) return this.#roundCursor();

    if (hovered?.kind === 'card' || this.deck.state !== 'idle') return this.deck.cursor;

    return hovered ? 'pointer' : 'auto';
  }

  // The canvas's tooltip: what a click on the thing under the pointer does.
  get hint(): string {
    const hovered = this.hovered;

    if (!hovered) return '';

    if (hovered.kind === 'prop') return this.#t(`table.props.${hovered.prop}`);

    if (this.round.isShown) return this.#roundHint(hovered);

    if (this.deck.state !== 'idle') return '';

    if (hovered.kind === 'leaflet') return this.#t('table.leafletHint');

    if (hovered.kind === 'tent') return this.#t('table.tentHint', { rule: hovered.name });

    return hovered.kind === 'card' && this.deck.isInDeck(hovered.id) ? this.#t('table.deckHint') : this.#t('table.cardHint');
  }

  hover(target: TableHover | null): void {
    this.hovered = target;
    this.deck.hover(target?.kind === 'card' ? target.id : null);

    if (target?.kind === 'hand') this.round.hand.hover(target.id, target.index);
    else if (this.round.hand.hoveredId !== null) this.round.hand.hover(null, null);
  }

  isHovered(prop: TableProp): boolean {
    return this.hovered?.kind === 'prop' && this.hovered.prop === prop;
  }

  poke(prop: TableProp): void {
    this.pokes.set(prop, { at: this.#now(), count: (this.pokes.get(prop)?.count ?? 0) + 1 });
    this.#sounds.play(propSounds[prop]);
  }

  // Leaving one thing: only clears the hover if it's still that thing (the pointer may already be
  // over the next card).
  leave(left: TableHover): void {
    if (this.hovered && sameTarget(this.hovered, left)) this.hover(null);
  }

  // The pointer anywhere on the page, while a card is pressed or held.
  move(screenX: number, screenY: number, point: { x: number; z: number } | null, now: number, felt: { x: number; z: number } | null = point): void {
    if (this.round.isShown) this.round.hand.move(screenX, screenY, point, now, felt);
    else this.deck.move(screenX, screenY, point, now);
  }

  release(): void {
    this.round.hand.release();
    this.deck.release();
  }

  // The pointer was taken away mid-gesture: nothing gets played.
  cancel(): void {
    this.round.hand.cancel();
    this.deck.release();
  }

  setInsets(left: number, right: number): void {
    this.insetLeft = Math.max(0, Math.round(left));
    this.insetRight = Math.max(0, Math.round(right));
  }

  #roundCursor(): string {
    const hovered = this.hovered;
    const { hand } = this.#game;

    if (this.round.hand.state === 'holding' || this.round.hand.state === 'pressing') return 'grabbing';

    if (hovered?.kind === 'hand') return hand.canPlay(hovered.id) ? 'grab' : 'not-allowed';

    if (hovered?.kind === 'roundDeck') return hand.canDraw ? 'pointer' : 'auto';

    if (hovered?.kind === 'bell') return hand.canRing ? 'pointer' : 'auto';

    return hovered?.kind === 'pile' && this.round.hand.state === 'selected' ? 'pointer' : hovered ? 'pointer' : 'auto';
  }

  #roundHint(hovered: TableHover): string {
    const { hand, turn } = this.#game;
    const t = this.#t;

    switch (hovered.kind) {
      case 'hand':
        if (this.round.hand.selectedId === hovered.id) return t('round.table.cardSelected');

        return hand.canPlay(hovered.id) ? t('round.table.cardHint') : hand.whyNot(hovered.id);
      case 'roundDeck':
        return hand.canDraw ? t('round.table.deckHint') : t('round.table.deckWait');
      case 'pile':
        return t('round.table.pileHint');
      case 'bell':
        return turn.bellLine || t('round.table.bellHint');
      case 'orb':
        return t('round.table.orbHint', { colour: t(`cards.colours.${hovered.colour}`) });
      default:
        return hovered.kind === 'leaflet' ? t('table.leafletHint') : '';
    }
  }
}
