// The bots (spec §6, §6.1). A bot sees exactly what a player in its seat would (a SeatView) and
// picks one of that seat's legal moves, so it can't cheat, and the demo table and live tables run
// the same code. The human-ish timing (the think, the jump-in) is the table's job.
import { cardColours, isWild, type Card } from '@wild-table/protocol';
import type { Move, SeatView } from './round/index.js';

export type BotLevel = 'random' | 'planner';

const pick = <T>(items: readonly T[], random: () => number): T | undefined => items[Math.floor(random() * items.length)];

// Layer 1: any legal move, at random. It leaves the bell alone: that's a sacrifice, for planners.
export const randomMove = (moves: readonly Move[], random: () => number): Move | null => pick(moves.filter((move) => move.type !== 'bell'), random) ?? null;

// How often the planner hits the Last card! bell when it can (spec §5.6): a sacrifice, so not always.
const bellChance = 0.6;

// The bell, when someone else is down to one card: unless it could win this turn instead.
const bellBlock = (view: SeatView, moves: readonly Move[], random: () => number): Move | null => {
  const canWin = view.hand.length === 1 && moves.some((move) => move.type === 'play');

  return !canWin && moves.some((move) => move.type === 'bell') && random() < bellChance ? { type: 'bell' } : null;
};

const holdsColourOf = (hand: readonly Card[], card: Card): number => (isWild(card) ? 0 : hand.filter((other) => !isWild(other) && other.colour === card.colour).length);

// How much the planner likes playing `card` now: dump points, hit the next player when they're
// close to going out, keep wilds for later, stay in the colour it holds most, and don't bluff.
const cardScore = (view: SeatView, card: Card): number => {
  const next = view.seats[(view.seats.indexOf(view.seat) + view.direction + view.seats.length) % view.seats.length] ?? view.seat;
  const nextIsClose = (view.counts[next] ?? 7) <= 2 ? 1 : 0;
  const nearlyOut = view.hand.length <= 2 ? 1 : 0;
  const colourWeight = holdsColourOf(view.hand, card) * 4;

  switch (card.kind) {
    case 'number':
      return card.value + colourWeight;
    case 'wild':
      return -25 + nearlyOut * 60;

    case 'wild4': {
      const bluff = view.hand.some((other) => !isWild(other) && other.colour === view.colour);

      return -35 + (bluff ? -40 : 0) + nextIsClose * 50 + nearlyOut * 60;
    }

    default:
      return 20 + nextIsClose * 40 + (card.kind === 'draw2' ? 5 : 0) + colourWeight;
  }
};

const bestPlay = (view: SeatView, moves: readonly Move[], random: () => number): Move | null => {
  const plays = moves.flatMap((move) => {
    const card = move.type === 'play' ? view.hand.find((candidate) => candidate.id === move.cardId) : undefined;

    return card ? [{ move, score: cardScore(view, card) + random() }] : [];
  });

  return plays.sort((a, b) => b.score - a.score)[0]?.move ?? null;
};

// The colour it holds most of, for a wild.
const bestColour = (view: SeatView): Move => {
  const counts = cardColours.map((colour) => view.hand.filter((card) => !isWild(card) && card.colour === colour).length);

  return { type: 'pickColour', colour: cardColours[counts.indexOf(Math.max(...counts))] ?? 'red' };
};

// Swap with whoever holds the fewest cards.
const bestSwap = (view: SeatView): Move => {
  const others = view.seats.filter((seat) => seat !== view.seat);
  const target = others.reduce((best, seat) => ((view.counts[seat] ?? 99) < (view.counts[best] ?? 99) ? seat : best), others[0] ?? view.seat);

  return { type: 'swap', target };
};

// Hit by a +2 or +4: stack if it can, challenge a +4 now and then, or take the cards.
const bestAnswer = (view: SeatView, moves: readonly Move[], random: () => number): Move | null => {
  const stack = moves.find((move) => move.type === 'play');

  if (stack) return stack;

  if (moves.some((move) => move.type === 'challenge') && random() < 0.3) return { type: 'challenge' };

  return { type: 'take' };
};

// Layer 2: the plan (spec §6). Out of turn it only ever jumps in.
export const plannedMove = (view: SeatView, moves: readonly Move[], random: () => number): Move | null => {
  const legal = moves.filter((move) => move.type !== 'bell');

  if (view.turn !== view.seat) return legal.find((move) => move.type === 'play') ?? null;

  switch (view.step) {
    case 'pickColour':
      return bestColour(view);
    case 'swap':
      return bestSwap(view);
    case 'answer':
      return bestAnswer(view, legal, random);
    case 'drawn':
      return legal.find((move) => move.type === 'play') ?? { type: 'keep' };
    case 'play':
      return bellBlock(view, moves, random) ?? bestPlay(view, legal, random) ?? { type: 'draw' };
  }
};

export const botMove = (level: BotLevel, view: SeatView, moves: readonly Move[], random: () => number): Move | null =>
  level === 'random' ? randomMove(moves, random) : plannedMove(view, moves, random);

// When a bot jumps in, in milliseconds, or null when it can't or won't (spec §5.7): holding the
// exact card on top out of turn, it slaps it down most of the time, after a moment's look.
export const botJumpInDelay = (view: SeatView, moves: readonly Move[], random: () => number): number | null => {
  if (view.turn === view.seat || !moves.some((move) => move.type === 'play')) return null;

  return random() < 0.75 ? 700 + random() * 1000 : null;
};
