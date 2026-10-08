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
] as const;

export type TableErrorCode = (typeof tableErrorCodes)[number];

export const isTableErrorCode = (value: unknown): value is TableErrorCode =>
  typeof value === 'string' && (tableErrorCodes as readonly string[]).includes(value);

// A refused intent, and which one it was.
export interface TableErrorEvent {
  code: TableErrorCode;
  type: TableIntentType;
}
