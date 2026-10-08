// Rounds built from short card codes, for the tests: 'r7' is a red 7, 'bS' a blue Skip, 'gR' a
// green Reverse, 'y+' a yellow +2, 'W' a Wild and 'W4' a Wild +4.
import { defaultGameSettings, isWild, type Card, type CardColour, type HouseRules } from '@wild-table/protocol';
import { createRandom } from '../random.js';
import { applyMove } from './apply.js';
import type { Move, MoveResult, RoundState, SeatId } from './types.js';

const colours: Record<string, CardColour> = { r: 'red', y: 'yellow', g: 'green', b: 'blue' };

let made = 0;

export const card = (code: string): Card => {
  const id = `${code}#${made++}`;

  if (code === 'W') return { kind: 'wild', id };

  if (code === 'W4') return { kind: 'wild4', id };

  const colour = colours[code[0] ?? ''] ?? 'red';
  const rest = code.slice(1);

  if (rest === 'S') return { kind: 'skip', colour, id };

  if (rest === 'R') return { kind: 'reverse', colour, id };

  if (rest === '+') return { kind: 'draw2', colour, id };

  return { kind: 'number', colour, value: Number(rest), id };
};

export interface RoundSetup {
  hands: Record<SeatId, string[]>;
  top: string;
  colour?: CardColour;
  // The deck's cards, the next one to be drawn last.
  deck?: string[];
  turn?: SeatId;
  rules?: Partial<HouseRules>;
}

export const makeRound = ({ hands, top, colour, deck = ['r1', 'g2', 'b3', 'y4', 'r5', 'g6', 'b7', 'y8'], turn, rules }: RoundSetup): RoundState => {
  const seats = Object.keys(hands);
  const topCard = card(top);

  return {
    seats,
    hands: Object.fromEntries(seats.map((seat) => [seat, (hands[seat] ?? []).map(card)])),
    deck: deck.map(card),
    pile: [card('g9'), topCard],
    colour: colour ?? (isWild(topCard) ? 'red' : topCard.colour),
    turn: turn ?? seats[0] ?? 'a',
    direction: 1,
    step: { kind: 'play' },
    pendingDraw: 0,
    wild4: null,
    race: null,
    earlyCall: null,
    rules: { ...defaultGameSettings.houseRules, ...rules },
    winner: null,
  };
};

// The codes in a seat's hand, for comparing.
export const codesOf = (state: RoundState, seat: SeatId): string[] => (state.hands[seat] ?? []).map((one) => one.id.split('#')[0] ?? '');

// Plays the first card in `seat`'s hand with this code.
export const play = (state: RoundState, seat: SeatId, code: string): MoveResult => {
  const found = (state.hands[seat] ?? []).find((one) => one.id.startsWith(`${code}#`));

  return applyMove(state, seat, { type: 'play', cardId: found?.id ?? 'none' }, createRandom(1));
};

export const move = (state: RoundState, seat: SeatId, what: Move): MoveResult => applyMove(state, seat, what, createRandom(1));

// The state after a move that has to work.
export const after = (result: MoveResult): RoundState => {
  if (!result.ok) throw new Error(`Move refused: ${result.error}`);

  return result.state;
};
