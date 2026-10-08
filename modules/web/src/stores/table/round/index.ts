import { isWild, type Card, type CardColour, type PlayEvent, type TableIntentType } from '@wild-table/protocol';
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
// the felt, the direction ring spinning, the bell ringing, a +4 slamming down (the camera shakes and
// the lamp swings), a hard throw nudging the camera, and a round won (the jukebox flashes). Times in
// performance.now() milliseconds.
export interface TableRoundEffects {
  slapAt: number;
  slapImpact: number;
  waveAt: number;
  spinAt: number;
  bellAt: number;
  slamAt: number;
  shakeAt: number;
  shake: number;
  winAt: number;
}

// Each event's beat before the next one plays, in milliseconds.
const beats: Partial<Record<PlayEvent['type'], number>> = { colour: 420, skipped: 420, reversed: 520, challenged: 900, swapped: 700, handsPassed: 800, reshuffled: 650, bell: 260 };

// How long a Skip's stamp stays on the skipped player's place card.
const stampMs = 1500;
// The round's winning card flies in slow motion for this long (spec §8).
const slowMoMs = 1300;
// A card sent to the pile that the table never answered for (the connection dropped, say) comes
// back after this long.
const pendingMs = 4000;
// When the beats run this late (a tab in the background gets its timers slowed down), or this many
// events wait, they aren't played one by one: the cards go straight to where they are now.
const lateMs = 900;
const backlog = 24;

// The round on the 3D table (spec §8, §10.2): every card in it, moving on springs. The table's
// events play in order, one beat at a time, so a fast bot never makes cards jump or skip; once
// they're all played, the cards settle on what the table says is true now. Your own plays fly at
// once, before the table answers, and come back if it says no.
export class TableRoundStore {
  readonly cards = new TableRoundCardsStore();
  readonly hand: TableRoundHandStore;
  // Where your hand sits in the view, worked out from the camera every frame.
  frame: HandFrame = defaultHandFrame;
  // Cards you've sent to the pile that the table hasn't confirmed yet, and when (performance.now()).
  readonly pending = new Map<string, number>();
  readonly effects: TableRoundEffects = { slapAt: -1, slapImpact: 0, waveAt: -1, spinAt: -1, bellAt: -1, slamAt: -1, shakeAt: -1, shake: 0, winAt: -1 };
  // A Skip's stamp on a place card, by seat: a new number for each, so it slams on again.
  readonly stamps = new Map<string, number>();
  // The colour in play and the direction, as far as the events have got.
  colour: CardColour | null = null;
  direction: 1 | -1 = 1;
  deckSize = 0;
  // The table's latest events are still being played out (a winning card flying in slow motion,
  // say): the round's result waits for them.
  isReplaying = false;
  #queue: PlayEvent[] = [];
  // How late the last beat came, in milliseconds.
  #late = 0;
  #stampCount = 0;
  // The +4 on its way to the pile: it slams down.
  #slamming: string | null = null;
  readonly #deps: TableRoundDeps;

  constructor(deps: TableRoundDeps) {
    const { game } = deps;

    this.#deps = deps;
    this.hand = new TableRoundHandStore({ hand: game.hand, captions: game.captions, body: (key) => this.cards.body(key), play: (...args) => this.playFromHand(...args) });
    makeAutoObservable(this, { frame: false, pending: false, effects: false, cards: false, hand: false, step: false, setFrame: false, portraitSpot: false, isPending: false }, { autoBind: true });
    game.listen({ played: this.receive, refused: this.refuse });
    reaction(() => [game.state, game.match.snapshot, game.hand.cards], () => this.#settleWhenIdle());
  }

  get isShown(): boolean {
    return this.#deps.game.state !== 'lobby';
  }

  // Your Wild is down and its colour is yours to pick: the orbs rise over the pile.
  get isPickingColour(): boolean {
    const { match } = this.#deps.game;

    return match.isMyTurn && match.round?.step === 'pickColour';
  }

  receive(events: readonly PlayEvent[]): void {
    this.#queue = [...this.#queue, ...events];

    if (this.isReplaying) return;

    // A moment's wait, so the snapshot and your hand that follow the events are in too.
    this.isReplaying = true;
    this.#later(60, () => this.#next());
  }

  // Off to the pile from your hand, before the table answers (spec §8.2).
  playFromHand(cardId: string, velocity: { x: number; y: number; z: number }, strength: number): boolean {
    const { hand } = this.#deps.game;
    const now = performance.now();

    if (!hand.canPlay(cardId)) return false;

    if (this.cards.faceOf(cardId)?.kind === 'wild4') this.#slamming = cardId;

    // On its way before the table hears of it, so a quick "no" finds it pending.
    this.pending.set(cardId, now);
    this.cards.move(cardId, { kind: 'pile' });
    this.cards.body(cardId)?.launch(velocity, strength);

    // Your last card wins the round: it flies in slow motion.
    if (hand.count === 1) this.cards.body(cardId)?.slowMo(now + slowMoMs);

    hand.play(cardId, strength);

    return true;
  }

  // Sent to the pile and not answered yet (for a few seconds at most).
  isPending(cardId: string): boolean {
    const at = this.pending.get(cardId);

    return at !== undefined && performance.now() - at < pendingMs;
  }

  // The table said no to a play: the card comes back to your hand, shaking its head. The table
  // answers in order, so it's the oldest card still waiting.
  refuse(type: TableIntentType): void {
    const cardId = this.pending.keys().next().value;

    if (type !== 'play' || cardId === undefined) return;

    this.pending.delete(cardId);
    this.cards.move(cardId, { kind: 'hand' });
    this.cards.body(cardId)?.refuse();

    if (this.#slamming === cardId) this.#slamming = null;

    this.#settleWhenIdle();
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

    // Nothing left, or too far behind to be worth playing out: the cards settle where they are.
    if (!event || this.#late > lateMs || this.#queue.length > backlog) {
      this.#queue = [];
      this.isReplaying = false;
      this.#late = 0;
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
        return this.#deal(event.first, event.handSize);
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
        // All but the top card went back into the deck (their ids come round again).
        this.cards.pile.slice(0, -1).forEach((key) => this.cards.remove(key));
        this.#settle();
        break;
      case 'swapped':
      case 'handsPassed':
        this.#settle();
        break;
      case 'skipped':
        this.#stamp(event.seat);
        break;
      case 'roundOver':
        this.effects.winAt = performance.now();
        break;
      default:
        break;
    }

    return beats[event.type] ?? 140;
  }

  // A new round: the table is cleared, the cards fly out to every seat one at a time, then the
  // first card turns up on the pile.
  #deal(first: Card, handSize: number): number {
    const { match, hand } = this.#deps.game;
    const seats = match.seats;
    const gap = Math.max(22, Math.min(60, 1400 / Math.max(1, seats.length * handSize)));

    this.cards.clear();
    this.pending.clear();
    this.colour = isWild(first) ? null : first.colour;
    this.direction = 1;
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

    this.#later(dealt + 200, () => this.cards.add(first.id, first, { kind: 'pile' }, { ...deckCardSpot(this.deckSize), y: 0.3 }));

    return dealt + 650;
  }

  #played({ seat, card, strength }: Extract<PlayEvent, { type: 'played' }>): number {
    const { cards } = this;

    if (this.pending.delete(card.id)) return Math.max(380, this.#moment(card.id, card.kind === 'wild4') - 40);

    // Already on the pile but not on top (it came round again after a reshuffle): back on top.
    if (cards.placeOf(card.id)?.kind === 'pile') {
      if (cards.pile.at(-1) !== card.id) cards.move(card.id, { kind: 'pile' });

      return 380;
    }

    if (seat === this.#deps.game.match.meId && cards.has(card.id)) cards.move(card.id, { kind: 'pile' });
    else {
      const backs = cards.seat(seat);
      const hovered = this.#deps.game.match.hovers.get(seat);
      const back = backs[hovered ?? Math.floor(backs.length / 2)] ?? backs.at(-1);

      if (back) cards.move(back, { kind: 'pile' }, { key: card.id, face: card });
      else cards.add(card.id, card, { kind: 'pile' }, { ...pileCardSpot(card.id, 0), y: 0.6 });
    }

    cards.body(card.id)?.launch({ x: 0, y: 0.5, z: 0 }, strength);

    return this.#moment(card.id, card.kind === 'wild4');
  }

  // A +4 slams down; the card that wins the round flies in slow motion.
  #moment(cardId: string, isWild4: boolean): number {
    if (isWild4) this.#slamming = cardId;

    const winning = this.#queue.findIndex((event) => event.type === 'roundOver');
    const nextPlay = this.#queue.findIndex((event) => event.type === 'played');

    if (winning >= 0 && (nextPlay < 0 || nextPlay > winning)) {
      this.cards.body(cardId)?.slowMo(performance.now() + slowMoMs);

      return slowMoMs + 300;
    }

    return isWild4 ? 650 : 420;
  }

  // The stamp slams onto the skipped player's place card, then lifts off.
  #stamp(seat: string): void {
    const id = ++this.#stampCount;

    this.stamps.set(seat, id);

    this.#later(stampMs, () => {
      if (this.stamps.get(seat) === id) this.stamps.delete(seat);
    });
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
    if (!this.isReplaying) this.#settle();
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
      this.#shake(top === this.#slamming, body.impact, now);
      this.#deps.sounds.play('slap', { level: 0.3 + body.impact * 0.7, rate: 0.9 + body.impact * 0.2 });
    }

    if (now - this.effects.slapAt > 2000) this.effects.slapImpact = 0;
  }

  // A +4 slams: the camera shakes and the lamp swings. A hard throw nudges the camera (D25).
  #shake(isSlam: boolean, impact: number, now: number): void {
    if (isSlam) {
      this.#slamming = null;
      this.effects.slamAt = now;
    }

    const shake = isSlam ? 0.6 + impact * 0.4 : impact > 0.7 ? impact * 0.25 : 0;

    if (shake === 0) return;

    this.effects.shakeAt = now;
    this.effects.shake = shake;
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

  // Runs `action` later, as an action, noting how late it came.
  #later(delayMs: number, action: () => void): void {
    const wait = Math.max(0, delayMs);
    const due = performance.now() + wait;

    this.#deps.schedule(() => {
      this.#late = performance.now() - due;
      runInAction(action);
    }, wait);
  }
}
