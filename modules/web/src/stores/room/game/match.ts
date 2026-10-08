import type { MatchSnapshot, MemberSnapshot, RoundSnapshot, SeatSnapshot, TableHoverEvent } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { PlayerColor } from '../types';

// A seat in the match, as the table and the portraits show it.
export interface MatchSeatView {
  id: string;
  name: string;
  initial: string;
  color: PlayerColor;
  cards: number;
  score: number;
  isMe: boolean;
  isTurn: boolean;
  // A bot plays the seat: a bot's own, or one standing in for its person (spec §4.5).
  isBot: boolean;
  standIn: boolean;
  // Down to one card, with the Last card! race open (spec §5.6).
  isRacing: boolean;
  // Round the table in degrees: 0 is your own place at the near edge, then clockwise in the order
  // of play, the others spread across the far side (spec §9).
  angle: number;
  cardsLabel: string;
  scoreLabel: string;
}

export interface RoomGameMatchDeps {
  t: Translate;
  // Who's at the table: bots are marked there.
  members: () => readonly MemberSnapshot[];
  now: () => number;
}

const arc = { from: 70, to: 290 };

// The match as everyone sees it (spec §4.3): the seats in the order of play, their cards and
// scores, and the round in progress. The table runs it; this only shows it.
export class RoomGameMatchStore {
  snapshot: MatchSnapshot | null = null;
  meId = '';
  // Which card each other player's pointer is over, by its place in their hand (spec §8). Read by
  // the 3D table every frame, not shown through React.
  readonly hovers = new Map<string, number>();
  // When the Last card! race now open began, on this browser's clock (spec §5.6).
  raceOpenedAt: number | null = null;
  readonly #deps: RoomGameMatchDeps;

  constructor(deps: RoomGameMatchDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { hovers: false }, { autoBind: true });
  }

  get round(): RoundSnapshot | null {
    return this.snapshot?.round ?? null;
  }

  // Dealt in this round, rather than watching until the next (D14).
  get isSeated(): boolean {
    return this.snapshot?.seats.some((seat) => seat.id === this.meId) ?? false;
  }

  get isMyTurn(): boolean {
    return this.round?.turn === this.meId && this.isSeated;
  }

  get seats(): MatchSeatView[] {
    const seats = this.snapshot?.seats ?? [];
    const mine = Math.max(0, seats.findIndex((seat) => seat.id === this.meId));
    const ordered = [...seats.slice(mine), ...seats.slice(0, mine)];
    const others = this.isSeated ? ordered.length - 1 : ordered.length;

    return ordered.map((seat, index) => {
      const place = this.isSeated ? index - 1 : index;
      const angle = this.isSeated && index === 0 ? 0 : arc.from + ((arc.to - arc.from) * (place + 0.5)) / Math.max(1, others);

      return this.#toView(seat, angle);
    });
  }

  get others(): MatchSeatView[] {
    return this.seats.filter((seat) => !seat.isMe);
  }

  get me(): MatchSeatView | null {
    return this.seats.find((seat) => seat.isMe) ?? null;
  }

  get turnSeat(): MatchSeatView | null {
    return this.seats.find((seat) => seat.isTurn) ?? null;
  }

  // Highest score first.
  get standings(): MatchSeatView[] {
    return [...this.seats].sort((a, b) => b.score - a.score);
  }

  seat(id: string | null): MatchSeatView | null {
    return this.seats.find((seat) => seat.id === id) ?? null;
  }

  nameOf(id: string | null): string {
    return this.seat(id)?.name ?? '';
  }

  receive(match: MatchSnapshot | null, meId: string): void {
    const race = match?.round?.race ?? null;

    if (race === null) this.raceOpenedAt = null;
    else if (race !== this.round?.race) this.raceOpenedAt = this.#deps.now();

    this.snapshot = match;
    this.meId = meId;

    if (!match?.round) this.hovers.clear();
  }

  receiveHover({ seat, index }: TableHoverEvent): void {
    if (index === null) this.hovers.delete(seat);
    else this.hovers.set(seat, index);
  }

  #toView(seat: SeatSnapshot, angle: number): MatchSeatView {
    const { t, members } = this.#deps;
    const round = this.round;
    const isBot = seat.standIn || members().find((member) => member.id === seat.id)?.bot === true;

    return {
      id: seat.id,
      name: seat.name,
      initial: seat.name.charAt(0).toUpperCase(),
      color: seat.color,
      cards: seat.cards,
      score: seat.score,
      isMe: seat.id === this.meId,
      isTurn: round?.turn === seat.id,
      isBot,
      standIn: seat.standIn,
      isRacing: round?.race === seat.id,
      angle,
      cardsLabel: t('round.cards', { count: seat.cards }),
      scoreLabel: t('round.score', { count: seat.score }),
    };
  }
}
