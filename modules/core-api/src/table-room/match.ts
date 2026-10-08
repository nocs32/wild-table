import type { Card, PlayerColor, RoundResult } from '@wild-table/protocol';

// Who sits in a seat, as the round started: kept if they leave mid-round.
export interface TableRoomSeatHolder {
  id: string;
  name: string;
  color: PlayerColor;
}

// Two timeouts in a row and a bot plays your seat until you're back (spec D11).
const timeoutsBeforeStandIn = 2;

// A match (spec §4): who sits where this round, the scores, and which seats a bot is playing for
// their person. Lives from the first deal to the podium.
export class TableRoomMatch {
  number = 0;
  seats: string[] = [];
  readonly holders = new Map<string, TableRoomSeatHolder>();
  readonly scores = new Map<string, number>();
  // People whose seat a bot is playing: they dropped out, or ran out of time twice in a row.
  readonly standIns = new Set<string>();
  readonly #timeouts = new Map<string, number>();
  lastWinner: string | null = null;
  result: RoundResult | null = null;
  champion: string | null = null;

  // A new match: scores from 0.
  begin(): void {
    this.number = 0;
    this.seats = [];
    this.holders.clear();
    this.scores.clear();
    this.standIns.clear();
    this.#timeouts.clear();
    this.lastWinner = null;
    this.result = null;
    this.champion = null;
  }

  // The next round's seats: newcomers start from 0 points (D14); people who left are gone.
  nextRound(holders: TableRoomSeatHolder[]): void {
    const seats = holders.map((holder) => holder.id);

    this.number++;
    this.seats = seats;
    this.result = null;
    this.#timeouts.clear();
    holders.forEach((holder) => this.holders.set(holder.id, holder));
    seats.forEach((seat) => this.scores.set(seat, this.scores.get(seat) ?? 0));
    [...this.standIns].filter((seat) => !seats.includes(seat)).forEach((seat) => this.standIns.delete(seat));
  }

  // The round is won. True when that's the match.
  win(winner: string, points: number, hands: Record<string, Card[]>, targetScore: number): boolean {
    const score = (this.scores.get(winner) ?? 0) + points;

    this.scores.set(winner, score);
    this.lastWinner = winner;
    this.result = { winner, points, hands };

    if (score >= targetScore) this.champion = winner;

    return this.champion !== null;
  }

  // A person made a move themselves: they're back.
  acted(seat: string): void {
    this.#timeouts.delete(seat);
    this.standIns.delete(seat);
  }

  timedOut(seat: string): void {
    const count = (this.#timeouts.get(seat) ?? 0) + 1;

    this.#timeouts.set(seat, count);

    if (count >= timeoutsBeforeStandIn) this.standIns.add(seat);
  }

  // Their connection is gone for good: a bot plays the rest of their round (spec §4.5).
  dropOut(seat: string): void {
    if (this.seats.includes(seat)) this.standIns.add(seat);
  }

  isSeated(seat: string): boolean {
    return this.seats.includes(seat);
  }
}
