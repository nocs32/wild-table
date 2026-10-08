import type { CardColour, PlayEvent, TableIntentType } from '@wild-table/protocol';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import type { Schedule, SoundsService } from '../../../services';
import type { RoomGameStore } from '../../room/game';
import { TableRoundCardsStore } from './cards';
import { TableRoundHandStore } from './hand';
import { deckCardSpot, defaultHandFrame, pileCardSpot, type HandFrame } from './layout';
import { placeCards, settleCards } from './settle';

export interface TableRoundDeps {
  game: RoomGameStore;
  schedule: Schedule;
  sounds: SoundsService;
}

// What just happened that the table shows for a moment (spec §8): the slap, a colour washing over
// the felt, the direction ring spinning, the bell ringing. Times in performance.now() milliseconds.
export interface TableRoundEffects {
  slapAt: number;
  slapImpact: number;
  waveAt: number;
  spinAt: number;
  bellAt: number;
}

// Each event's beat before the next one plays, in milliseconds.
const beats: Partial<Record<PlayEvent['type'], number>> = { colour: 420, skipped: 420, reversed: 520, challenged: 900, swapped: 700, handsPassed: 800, reshuffled: 650, bell: 260 };

// The round on the 3D table (spec §8, §10.2): every card in it, moving on springs. The table's
// events play in order, one beat at a time, so a fast bot never makes cards jump or skip; once
// they're all played, the cards settle on what the table says is true now. Your own plays fly at
// once, before the table answers, and come back if it says no.
export class TableRoundStore {
  readonly cards = new TableRoundCardsStore();
  readonly hand: TableRoundHandStore;
  // Where your hand sits in the view, worked out from the camera every frame.
  frame: HandFrame = defaultHandFrame;
  // Cards you've sent to the pile that the table hasn't confirmed yet.
  readonly pending = new Set<string>();
  readonly effects: TableRoundEffects = { slapAt: -1, slapImpact: 0, waveAt: -1, spinAt: -1, bellAt: -1 };
  // The colour in play and the direction, as far as the events have got.
  colour: CardColour | null = null;
  direction: 1 | -1 = 1;
  deckSize = 0;
  #queue: PlayEvent[] = [];
  #busy = false;
  readonly #deps: TableRoundDeps;

  constructor(deps: TableRoundDeps) {
    const { game } = deps;

    this.#deps = deps;
    this.hand = new TableRoundHandStore({ hand: game.hand, captions: game.captions, body: this.cards.body, play: (...args) => this.playFromHand(...args) });
    makeAutoObservable(this, { frame: false, pending: false, effects: false, cards: false, hand: false, step: false }, { autoBind: true });
    game.listen({ played: this.receive, refused: this.refuse });
    reaction(() => [game.state, game.match.snapshot, game.hand.cards], () => this.#settleWhenIdle());
  }

  get isShown(): boolean {
    return this.#deps.game.state !== 'lobby';
  }

  receive(events: readonly PlayEvent[]): void {
    this.#queue = [...this.#queue, ...events];

    if (this.#busy) return;

    // A moment's wait, so the snapshot and your hand that follow the events are in too.
    this.#busy = true;
    this.#later(60, () => this.#next());
  }

  // Off to the pile from your hand, before the table answers (spec §8.2).
  playFromHand(cardId: string, velocity: { x: number; y: number; z: number }, strength: number): boolean {
    if (!this.#deps.game.hand.play(cardId, strength)) return false;

    this.pending.add(cardId);
    this.cards.move(cardId, { kind: 'pile' });
    this.cards.body(cardId)?.launch(velocity, strength);

    return true;
  }

  // The table said no to a play: the card comes back to your hand, shaking its head.
  refuse(type: TableIntentType): void {
    if (type !== 'play') return;

    [...this.pending].forEach((cardId) => {
      this.cards.move(cardId, { kind: 'hand' });
      this.cards.body(cardId)?.refuse();
    });

    this.pending.clear();
  }

  // Where a player's place card stands: just outside the rail at their seat; yours just above the
  // left end of your hand.
  portraitSpot(angle: number, isMe: boolean): [number, number, number] {
    const { origin, right, up, width } = this.frame;

    if (isMe) return [0, 1, 2].map((axis) => (origin[axis] ?? 0) - (right[axis] ?? 0) * width * 0.36 + (up[axis] ?? 0) * 0.14) as [number, number, number];

    const turn = (angle * Math.PI) / 180;

    return [-Math.sin(turn) * 1.74, 0.12, Math.cos(turn) * 1.4];
  }

  setFrame(frame: HandFrame): void {
    this.frame = frame;
  }

  // Every frame: where each card is headed, then a step of its springs.
  step(dt: number, now: number): void {
    placeCards(this, this.#deps.game);
    this.cards.views.forEach(({ key }) => this.cards.body(key)?.step(dt, now));
    this.#watchSlaps(now);
  }

  #next(): void {
    const event = this.#queue[0];

    if (!event) {
      this.#busy = false;
      this.#settle();

      return;
    }

    this.#queue = this.#queue.slice(1);

    // A backlog plays faster.
    const pace = this.#queue.length > 6 ? 0.35 : 1;

    this.#later(this.#play(event) * pace, () => this.#next());
  }

  #play(event: PlayEvent): number {
    switch (event.type) {
      case 'dealt':
        return this.#deal(event.first.id, event.handSize, event.first);
      case 'played':
        return this.#played(event);
      case 'drew':
        return this.#drew(event.seat, event.count);
      case 'colour':
        this.colour = event.colour;
        this.effects.waveAt = performance.now();
        break;
      case 'reversed':
        this.direction = event.direction;
        this.effects.spinAt = performance.now();
        break;
      case 'bell':
        this.effects.bellAt = performance.now();
        this.#deps.sounds.play('bell');
        break;
      case 'reshuffled':
        this.#deps.sounds.play('shuffle');
        this.#settle();
        break;
      case 'swapped':
      case 'handsPassed':
        this.#settle();
        break;
      default:
        break;
    }

    return beats[event.type] ?? 140;
  }

  // A new round: the table is cleared, the cards fly out to every seat one at a time, then the
  // first card turns up on the pile.
  #deal(firstId: string, handSize: number, first: Parameters<TableRoundCardsStore['add']>[1]): number {
    const { match, hand } = this.#deps.game;
    const seats = match.seats;
    const gap = Math.max(22, Math.min(60, 1400 / Math.max(1, seats.length * handSize)));

    this.cards.clear();
    this.pending.clear();
    this.deckSize = 108 - seats.length * handSize;
    this.#deps.sounds.play('shuffle', { level: 0.7 });

    for (let index = 0; index < handSize; index++) {
      seats.forEach((seat, order) => {
        this.#later((index * seats.length + order) * gap, () => {
          const card = seat.isMe ? hand.cards[index] : undefined;

          this.#deps.sounds.play('deal', { level: 0.4, rate: 0.95 + (order % 3) * 0.05 });

          if (card && !this.cards.has(card.id)) this.cards.add(card.id, card, { kind: 'hand' }, deckCardSpot(this.deckSize));
          else if (!seat.isMe) this.cards.addBack(seat.id, deckCardSpot(this.deckSize));
        });
      });
    }

    const dealt = seats.length * handSize * gap;

    this.#later(dealt + 200, () => this.cards.add(firstId, first, { kind: 'pile' }, { ...deckCardSpot(this.deckSize), y: 0.3 }));

    return dealt + 650;
  }

  #played({ seat, card, strength }: Extract<PlayEvent, { type: 'played' }>): number {
    const { cards } = this;

    if (this.pending.delete(card.id) || cards.placeOf(card.id)?.kind === 'pile') return 380;

    if (seat === this.#deps.game.match.meId && cards.has(card.id)) cards.move(card.id, { kind: 'pile' });
    else {
      const backs = cards.seat(seat);
      const hovered = this.#deps.game.match.hovers.get(seat);
      const back = backs[hovered ?? Math.floor(backs.length / 2)] ?? backs.at(-1);

      if (back) cards.move(back, { kind: 'pile' }, { key: card.id, face: card });
      else cards.add(card.id, card, { kind: 'pile' }, { ...pileCardSpot(card.id, 0), y: 0.6 });
    }

    cards.body(card.id)?.launch({ x: 0, y: 0.5, z: 0 }, strength);

    return card.kind === 'wild4' ? 650 : 420;
  }

  // Cards off the top of the deck, one after another, to whoever drew them.
  #drew(seat: string, count: number): number {
    const { match, hand } = this.#deps.game;
    const isMe = seat === match.meId;
    const fresh = isMe ? hand.cards.filter((card) => !this.cards.has(card.id)) : [];

    for (let index = 0; index < count; index++) {
      this.#later(index * 110, () => {
        const card = fresh[index];

        this.deckSize = Math.max(0, this.deckSize - 1);
        this.#deps.sounds.play('deal', { level: 0.7, rate: 1 + index * 0.04 });

        if (card) this.cards.add(card.id, card, { kind: 'hand' }, deckCardSpot(this.deckSize));
        else if (!isMe) this.cards.addBack(seat, deckCardSpot(this.deckSize));
      });
    }

    return count * 110 + 260;
  }

  #settleWhenIdle(): void {
    if (!this.#busy) this.#settle();
  }

  #settle(): void {
    settleCards(this, this.#deps.game);
  }

  // The pile jumps when a card slaps onto it, harder for a harder throw (D25).
  #watchSlaps(now: number): void {
    const top = this.cards.pile.at(-1);
    const body = top ? this.cards.body(top) : null;

    if (body && body.landedAt > this.effects.slapAt) {
      this.effects.slapAt = body.landedAt;
      this.effects.slapImpact = body.impact;
      this.#jostle(body.impact);
      this.#deps.sounds.play('slap', { level: 0.3 + body.impact * 0.7, rate: 0.9 + body.impact * 0.2 });
    }

    if (now - this.effects.slapAt > 2000) this.effects.slapImpact = 0;
  }

  // The cards under a slap shift a little across the felt, harder for a harder slap, and settle
  // back (spec §8.2). Only sideways: nothing ever dips into the pile.
  #jostle(impact: number): void {
    this.cards.pile.slice(0, -1).forEach((key, index) => {
      const body = this.cards.body(key);
      const side = ((index * 37) % 7) / 3 - 1;

      if (!body) return;

      body.x.velocity += side * impact * 0.35;
      body.z.velocity += (((index * 53) % 5) / 2 - 1) * impact * 0.25;
      body.yaw.velocity += side * impact * 1.2;
    });
  }

  #later(delayMs: number, action: () => void): void {
    this.#deps.schedule(() => runInAction(action), Math.max(0, delayMs));
  }
}
