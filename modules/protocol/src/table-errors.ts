import type { TableIntentType } from './table-messages.js';

// Error codes of the live table. A refused join arrives as the join error's message; a refused
// intent arrives as an `error` event ({ code, type }) and the sender stays at the table.
export const tableErrorCodes = [
  // The web app and the server speak different protocol versions: reload.
  'PROTOCOL_MISMATCH',
  'INVALID_JOIN',
  'INVALID_MESSAGE',
  'RATE_LIMITED',
  'NOT_A_MEMBER',
  'ALREADY_A_MEMBER',
  'ROOM_CLOSED',
  // A rename that's empty once cleaned up.
  'EMPTY_NAME',
  // The game isn't in the phase this needs (settings outside the lobby…).
  'WRONG_PHASE',
  // Every seat is taken, so no bot can sit down.
  'TABLE_FULL',
  // Only bots can be sent away from the table.
  'NOT_A_BOT',
  // Start needs two seats filled.
  'NOT_ENOUGH_PLAYERS',
  // Watching this round: dealt in at the next one (D14).
  'NOT_PLAYING',
  // The moves' refusals (spec §5), as the rules engine gives them.
  'NOT_YOUR_TURN',
  'NOT_IN_HAND',
  'DOES_NOT_FIT',
  'WRONG_STEP',
  // The Last card! bell needs someone else down to one card, and rings once a round for each player.
  'NO_TARGET',
  'BELL_USED',
  'NOT_A_SEAT',
] as const;

export type TableErrorCode = (typeof tableErrorCodes)[number];

export const isTableErrorCode = (value: unknown): value is TableErrorCode =>
  typeof value === 'string' && (tableErrorCodes as readonly string[]).includes(value);

// A refused intent, and which one it was.
export interface TableErrorEvent {
  code: TableErrorCode;
  type: TableIntentType;
}
