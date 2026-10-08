import * as v from 'valibot';
import { cardColours } from './cards.js';
import { personNameMaxLength } from './players.js';
import { emoteLines } from './round.js';

// Bumped whenever an intent or an event changes shape. A web app on another version is turned
// away with PROTOCOL_MISMATCH and asked to reload.
export const tableProtocolVersion = 5;

// The Colyseus room type the web app creates and joins.
export const tableRoomName = 'table';

export const chatMaxLength = 200;

// How fast one person may chat: the browser keeps to this pace and holds a line back when it's
// faster (spec §10.5). The server's own cap is a little looser, so network jitter never trips it.
export const chatPace = { count: 5, windowMs: 3000 } as const;

export const emojiMaxLength = 32;

// Emoji plus their components (joiners, variation selectors, keycaps, skin tones), with at
// least one non-ASCII character so plain digits, # and * don't count.
const emojiPattern = /^[\p{Emoji}\p{Emoji_Component}]+$/u;
const asciiPattern = /^[\x20-\x7e]*$/u;

const isEmoji = (text: string): boolean => emojiPattern.test(text) && !asciiPattern.test(text);

const integer = (low: number, high: number): v.GenericSchema<number> => v.pipe(v.number(), v.integer(), v.minValue(low), v.maxValue(high));

// Settings are clamped on the server, so these bounds only keep junk out.
const settingsPatch = v.partial(
  v.strictObject({
    targetScore: integer(0, 10_000),
    turnSeconds: integer(0, 1000),
    handSize: integer(0, 100),
    houseRules: v.partial(
      v.strictObject({
        stacking: v.boolean(),
        jumpIn: v.boolean(),
        sevenZero: v.boolean(),
        drawUntilPlayable: v.boolean(),
        wild4AnyTime: v.boolean(),
      }),
    ),
  }),
);

// Member ids are session ids (people) or bot ids, both short.
const memberId = v.pipe(v.string(), v.maxLength(64));

// A card's id, like "red-7.1" or "wild4.3".
const cardId = v.pipe(v.string(), v.maxLength(32));

const empty = v.strictObject({});

// Sent with create and join. `name` is the name this browser picked before (null: the table makes one up).
export const tableJoinOptionsSchema = v.strictObject({
  protocolVersion: v.pipe(v.number(), v.integer()),
  name: v.nullable(v.pipe(v.string(), v.maxLength(personNameMaxLength * 2))),
});

export type TableJoinOptions = v.InferOutput<typeof tableJoinOptionsSchema>;

// Client → server: intents only; the server works out every result. Every message is checked
// against its schema, and unknown fields are rejected.
export const tableIntentSchemas = {
  // "Send me everything": after joining or reconnecting, once the browser listens.
  sync: empty,
  updateSettings: settingsPatch,
  chat: v.strictObject({ text: v.pipe(v.string(), v.maxLength(chatMaxLength)) }),
  react: v.strictObject({ emoji: v.pipe(v.string(), v.maxLength(emojiMaxLength), v.check(isEmoji)) }),
  rename: v.strictObject({ name: v.pipe(v.string(), v.maxLength(personNameMaxLength * 2)) }),
  // Anyone in the lobby may sit a bot in a free seat, or send one away (spec §4.2).
  addBot: empty,
  removeBot: v.strictObject({ memberId }),
  // Deals the first round; anyone may, once two seats are filled.
  start: empty,
  // The moves (spec §5): the server checks each against the rules. `strength` is how hard the card
  // was thrown, 0 to 1, for the slap everyone sees (D25).
  play: v.strictObject({ cardId, strength: v.pipe(v.number(), v.minValue(0), v.maxValue(1)) }),
  draw: empty,
  keep: empty,
  pickColour: v.strictObject({ colour: v.picklist(cardColours) }),
  challenge: empty,
  take: empty,
  swap: v.strictObject({ target: memberId }),
  bell: empty,
  // The pointer over a card in your hand (its place, or none), so others see you thinking (§8).
  hover: v.strictObject({ index: v.nullable(integer(0, 200)) }),
  emote: v.strictObject({ line: v.picklist(emoteLines) }),
  // Skips the wait after a round; after the podium, back to the lobby.
  nextRound: empty,
  playAgain: empty,
};

export type TableIntentType = keyof typeof tableIntentSchemas;

export type TableIntents = { [K in TableIntentType]: v.InferOutput<(typeof tableIntentSchemas)[K]> };
