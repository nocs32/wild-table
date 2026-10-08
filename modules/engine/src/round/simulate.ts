// Bot matches played start to finish, for the simulations (spec §11): every match must end, no
// state may get stuck, and all 108 cards must always be somewhere.
import type { GameSettings } from '@wild-table/protocol';
import { botMove, type BotLevel } from '../bots.js';
import { applyMove, applyTimeout } from './apply.js';
import { dealRound, nextFirstSeat } from './deal.js';
import { roundPoints } from './table.js';
import type { MoveResult, RoundState, SeatId } from './types.js';
import { legalMoves, seatView } from './view.js';

export interface SimulatedMatch {
  rounds: number;
  turns: number;
  winner: SeatId;
  scores: Record<SeatId, number>;
  // A round that hit the move limit without ending.
  stalled: boolean;
  // Every state seen held 108 cards.
  allCardsKept: boolean;
}

const moveLimit = 4000;

const cardCount = (state: RoundState): number => state.deck.length + state.pile.length + Object.values(state.hands).reduce((total, hand) => total + hand.length, 0);

const nextMove = (state: RoundState, levels: Record<SeatId, BotLevel>, random: () => number): MoveResult => {
  const seat = state.turn;
  const move = botMove(levels[seat] ?? 'random', seatView(state, seat), legalMoves(state, seat), random);

  return move ? applyMove(state, seat, move, random) : applyTimeout(state, random);
};

interface SimulatedRound {
  state: RoundState;
  moves: number;
  allCardsKept: boolean;
}

const playRound = (start: RoundState, levels: Record<SeatId, BotLevel>, random: () => number): SimulatedRound => {
  let state = start;
  let moves = 0;
  let allCardsKept = cardCount(state) === 108;

  while (state.winner === null && moves < moveLimit) {
    const result = nextMove(state, levels, random);

    if (!result.ok) throw new Error(`A bot made a refused move: ${result.error}`);

    state = result.state;
    moves++;
    allCardsKept = allCardsKept && cardCount(state) === 108;
  }

  return { state, moves, allCardsKept };
};

export const simulateMatch = (levels: Record<SeatId, BotLevel>, settings: GameSettings, random: () => number): SimulatedMatch => {
  const seats = Object.keys(levels);
  const scores: Record<SeatId, number> = Object.fromEntries(seats.map((seat) => [seat, 0]));
  const match = { rounds: 0, turns: 0, stalled: false, allCardsKept: true, lastWinner: null as SeatId | null };

  while (seats.every((seat) => (scores[seat] ?? 0) < settings.targetScore) && !match.stalled) {
    const first = nextFirstSeat(seats, match.lastWinner, random);
    const { state } = dealRound({ seats, rules: settings.houseRules, handSize: settings.handSize, first, random });
    const round = playRound(state, levels, random);
    const winner = round.state.winner;

    match.rounds++;
    match.turns += round.moves;
    match.allCardsKept = match.allCardsKept && round.allCardsKept;
    match.stalled = winner === null;

    if (winner !== null) scores[winner] = (scores[winner] ?? 0) + roundPoints(round.state, winner);

    match.lastWinner = winner;
  }

  const winner = seats.reduce((best, seat) => ((scores[seat] ?? 0) > (scores[best] ?? 0) ? seat : best), seats[0] ?? '');

  return { rounds: match.rounds, turns: match.turns, winner, scores, stalled: match.stalled, allCardsKept: match.allCardsKept };
};
