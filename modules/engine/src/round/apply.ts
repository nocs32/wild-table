// Every move goes through here: checked against the rules and worked out on a copy, so a refused
// move changes nothing (spec §10.3).
import { cardColours, isWild, type CardColour } from '@wild-table/protocol';
import { challenge, keepDrawn, pickColour, takeCards } from './answers.js';
import { ringBell } from './bell.js';
import { drawCard } from './draw.js';
import { playCard } from './play.js';
import { swapHands } from './seven-zero.js';
import { handOf } from './table.js';
import type { Move, MoveError, MoveResult, RoundContext, RoundState, SeatId } from './types.js';

// Cards never change, so copying the lists is enough.
const copyRound = (state: RoundState): RoundState => ({
  ...state,
  seats: [...state.seats],
  hands: Object.fromEntries(Object.entries(state.hands).map(([seat, hand]) => [seat, [...hand]])),
  deck: [...state.deck],
  pile: [...state.pile],
  step: { ...state.step },
  wild4: state.wild4 && { ...state.wild4 },
  rules: { ...state.rules },
});

const run = (context: RoundContext, seat: SeatId, move: Move): MoveError | null => {
  switch (move.type) {
    case 'play':
      return playCard(context, seat, move.cardId);
    case 'draw':
      return drawCard(context, seat);
    case 'keep':
      return keepDrawn(context, seat);
    case 'pickColour':
      return pickColour(context, seat, move.colour);
    case 'challenge':
      return challenge(context, seat);
    case 'take':
      return takeCards(context, seat);
    case 'swap':
      return swapHands(context, seat, move.target);
    case 'bell':
      return ringBell(context, seat);
  }
};

export const applyMove = (state: RoundState, seat: SeatId, move: Move, random: () => number): MoveResult => {
  if (state.winner !== null) return { ok: false, error: 'ROUND_OVER' };

  if (!state.seats.includes(seat)) return { ok: false, error: 'NOT_A_SEAT' };

  const context: RoundContext = { state: copyRound(state), events: [], random };
  const error = run(context, seat, move);

  return error ? { ok: false, error } : { ok: true, state: context.state, events: context.events };
};

// The colour a hand holds most of (wilds don't count); the first colour when there's none.
export const mostHeldColour = (state: RoundState, seat: SeatId): CardColour => {
  const counts = cardColours.map((colour) => handOf(state, seat).filter((card) => !isWild(card) && card.colour === colour).length);
  const best = Math.max(...counts);

  return cardColours[counts.indexOf(best)] ?? 'red';
};

// What happens when the turn's time runs out (spec D11): draw a card and pass, keep a drawn card,
// pick the colour held most, take the cards, or swap with whoever holds fewest.
export const timeoutMove = (state: RoundState): Move => {
  const seat = state.turn;

  switch (state.step.kind) {
    case 'play':
      return { type: 'draw' };
    case 'drawn':
      return { type: 'keep' };
    case 'pickColour':
      return { type: 'pickColour', colour: mostHeldColour(state, seat) };
    case 'answer':
      return { type: 'take' };

    case 'swap': {
      const others = state.seats.filter((other) => other !== seat);
      const fewest = Math.min(...others.map((other) => handOf(state, other).length));

      return { type: 'swap', target: others.find((other) => handOf(state, other).length === fewest) ?? others[0] ?? seat };
    }
  }
};

// Runs out the clock on the turn: a draw on timeout passes the turn even when the card fits.
export const applyTimeout = (state: RoundState, random: () => number): MoveResult => {
  const move = timeoutMove(state);

  if (state.winner !== null) return { ok: false, error: 'ROUND_OVER' };

  if (move.type !== 'draw') return applyMove(state, state.turn, move, random);

  const context: RoundContext = { state: copyRound(state), events: [], random };
  const error = drawCard(context, state.turn, 'timeout');

  return error ? { ok: false, error } : { ok: true, state: context.state, events: context.events };
};
