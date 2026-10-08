import {
  feedMaxItems,
  type FeedItem,
  type GameSnapshot,
  type HandSnapshot,
  type MatchSnapshot,
  type MemberSnapshot,
  type TableFeedEvent,
  type TableSnapshot,
  type TableViewEvent,
} from '@wild-table/protocol';

// Clock samples kept: the best of the recent ones wins.
const maxSamples = 10;

// The match's deadlines (a turn's end, the next deal), on this browser's clock.
const localMatch = (match: MatchSnapshot | null, local: (at: number) => number): MatchSnapshot | null => {
  if (!match) return null;

  return {
    ...match,
    round: match.round ? { ...match.round, endsAt: local(match.round.endsAt) } : null,
    nextAt: match.nextAt === null ? null : local(match.nextAt),
  };
};

// Puts the server's view and feed back together into the snapshots the stores read, the same
// shape the demo table sends. Server times become this browser's times: each view carries the
// server's clock, and the gap to ours, minus the trip, is the offset. A slow trip only makes a
// sample smaller, so the largest recent one is the closest.
export class LiveTableView {
  #members: MemberSnapshot[] = [];
  #game: GameSnapshot | null = null;
  #feed: FeedItem[] = [];
  #hand: HandSnapshot | null = null;
  #samples: number[] = [];
  readonly #now: () => number;
  readonly #emit: (snapshot: TableSnapshot) => void;

  constructor(now: () => number, emit: (snapshot: TableSnapshot) => void) {
    this.#now = now;
    this.#emit = emit;
  }

  view({ now, members, game }: TableViewEvent): void {
    this.#samples = [...this.#samples, now - this.#now()].slice(-maxSamples);
    this.#members = members;
    this.#game = game;
    this.#send();
  }

  // Your own cards, sent to you alone (spec D13).
  hand(hand: HandSnapshot): void {
    this.#hand = hand;
    this.#send();
  }

  feed({ reset, items }: TableFeedEvent): void {
    this.#feed = (reset ? items : [...this.#feed, ...items]).slice(-feedMaxItems);
    this.#send();
  }

  // How far the server's clock is ahead of ours.
  get #offset(): number {
    return this.#samples.length > 0 ? Math.max(...this.#samples) : 0;
  }

  #send(): void {
    const game = this.#game;
    const local = (at: number): number => at - this.#offset;

    if (!game) return;

    this.#emit({
      members: this.#members,
      game: { ...game, match: localMatch(game.match, local) },
      // Only while a round is being played: between rounds nobody holds cards.
      hand: game.phase === 'round' ? this.#hand : null,
      feed: this.#feed.map((item) => ({ ...item, at: local(item.at) })),
    });
  }
}
