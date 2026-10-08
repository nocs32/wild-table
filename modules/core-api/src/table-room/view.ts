import { roundSnapshot } from '@wild-table/engine';
import type { GameSnapshot, MatchSnapshot, MemberSnapshot, RoundSnapshot, SeatSnapshot } from '@wild-table/protocol';
import type { TableRoomCards } from './cards.js';
import type { TableRoomClock } from './clock.js';
import type { TableRoomGame } from './game.js';
import type { TableRoomMember } from './members.js';

// What the table looks like from outside: the shared view, the same for everyone. Seats carry card
// counts; hands go only to their owner (spec D13, §10.4), never through here.

export interface TableRoomView {
  members: MemberSnapshot[];
  game: GameSnapshot;
}

export interface TableRoomViewParts {
  members: readonly TableRoomMember[];
  game: TableRoomGame;
  cards: TableRoomCards;
  clock: TableRoomClock;
  now: () => number;
}

const seatsView = ({ members, game, cards }: TableRoomViewParts): SeatSnapshot[] =>
  game.match.seats.map((id) => {
    const holder = members.find((member) => member.id === id) ?? game.match.holders.get(id);

    return { id, name: holder?.name ?? '', color: holder?.color ?? 'teal', cards: cards.cardsOf(id), score: game.match.scores.get(id) ?? 0, standIn: game.match.standIns.has(id) };
  });

const roundView = ({ game, cards, clock, now }: TableRoomViewParts): RoundSnapshot | null => {
  const round = cards.round;

  if (game.phase !== 'round' || !round) return null;

  return roundSnapshot(round, clock.endsAt ?? now());
};

const matchView = (parts: TableRoomViewParts): MatchSnapshot | null => {
  const { game, clock } = parts;

  if (game.phase === 'lobby') return null;

  return {
    number: game.match.number,
    seats: seatsView(parts),
    round: roundView(parts),
    result: game.match.result,
    nextAt: game.phase === 'roundOver' ? clock.endsAt : null,
    champion: game.match.champion,
  };
};

export const tableView = (parts: TableRoomViewParts): TableRoomView => ({
  members: parts.members.map(({ id, name, color, connected, bot }) => ({ id, name, color, connected, bot })),
  game: { phase: parts.game.phase, settings: parts.game.settings, match: matchView(parts) },
});
