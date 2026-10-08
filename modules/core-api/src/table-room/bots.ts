import { botJumpInDelay, botMove, handOf, type RoundState } from '@wild-table/engine';
import { gameLimits } from '@wild-table/protocol';
import { limits } from '../limits.js';
import type { TableRoomCards } from './cards.js';
import { TableRoomError } from './error.js';
import type { TableRoomFeed } from './feed.js';
import type { TableRoomGame } from './game.js';
import type { Schedule } from './lifecycle.js';
import type { TableRoomMember, TableRoomMembers } from './members.js';

export interface TableRoomBotsDeps {
  members: TableRoomMembers;
  feed: TableRoomFeed;
  game: Pick<TableRoomGame, 'phase' | 'match' | 'botMove'>;
  cards: TableRoomCards;
  schedule: Schedule;
  now: () => number;
  random: () => number;
  createId: () => string;
  // A bot moved on its own: everyone needs to hear about it.
  changed: () => void;
}

const { botThinkMs } = limits.table;

// The bots (spec D9, §6, §6.1 layer 3). In the lobby, anyone may sit one down in a free seat or send
// one away, and a person who arrives at a full table takes the newest bot's seat. In a round, a bot
// plays its own seat, and the seat of anyone who dropped out or ran out of time twice, after a
// human-ish think (the bell is one of its moves, spec §5.6); and with Jump-in on, it slaps down the
// exact card on top out of turn.
export class TableRoomBots {
  #thinking: { key: string; cancel: () => void } | null = null;
  #jumpKey: string | null = null;
  readonly #jumps = new Map<string, () => void>();
  readonly #deps: TableRoomBotsDeps;

  constructor(deps: TableRoomBotsDeps) {
    this.#deps = deps;
  }

  add(authorId: string): TableRoomMember {
    const { members, feed } = this.#deps;
    const author = members.get(authorId);

    this.#checkLobby();

    if (members.count >= gameLimits.maxPlayers) throw new TableRoomError('TABLE_FULL');

    const bot = members.seatBot(`bot-${this.#deps.createId()}`);

    feed.system(author, { type: 'botAdded', name: bot.name });

    return bot;
  }

  remove(authorId: string, botId: string): void {
    const { members, feed } = this.#deps;
    const author = members.get(authorId);

    this.#checkLobby();

    if (!members.get(botId).bot) throw new TableRoomError('NOT_A_BOT');

    feed.system(author, { type: 'botRemoved', name: members.leave(botId).name });
  }

  // Someone is sitting down at a full table in the lobby: the newest bot gets up for them. In a
  // match, newcomers watch, and the next deal makes room.
  makeRoom(): void {
    const { members, feed } = this.#deps;
    const bot = members.newestBot;

    if (!bot || members.count < gameLimits.maxPlayers || this.#deps.game.phase !== 'lobby') return;

    members.leave(bot.id);
    feed.system(bot, { type: 'left' });
  }

  // After every change: the bot whose turn it is starts thinking, and bots holding the top card
  // may jump in.
  drive(): void {
    const round = this.#deps.cards.round;

    if (this.#deps.game.phase !== 'round' || !round) {
      this.dispose();

      return;
    }

    this.#planTurn(round);
    this.#planJumpIns(round);
  }

  dispose(): void {
    this.#thinking?.cancel();
    this.#thinking = null;
    this.#cancelJumps();
    this.#jumpKey = null;
  }

  #checkLobby(): void {
    if (this.#deps.game.phase !== 'lobby') throw new TableRoomError('WRONG_PHASE');
  }

  #isBot(seat: string): boolean {
    return this.#deps.members.find(seat)?.bot === true || this.#deps.game.match.standIns.has(seat);
  }

  // One think per decision: a new decision (another turn, another step) replaces the old one.
  #planTurn(round: RoundState): void {
    const { schedule, random } = this.#deps;
    const seat = round.turn;
    const key = [seat, round.step.kind, round.pile.length, round.deck.length, handOf(round, seat).length].join('|');

    if (this.#thinking?.key === key) return;

    this.#thinking?.cancel();
    this.#thinking = null;

    if (!this.#isBot(seat)) return;

    const delay = botThinkMs.min + random() * (botThinkMs.max - botThinkMs.min);

    this.#thinking = { key, cancel: schedule(() => this.#play(seat), delay) };
  }

  #play(seat: string): void {
    const { cards, game, random } = this.#deps;

    this.#thinking = null;

    this.#safely(() => {
      const move = botMove('planner', cards.view(seat), cards.legal(seat), random);

      if (move) game.botMove(seat, move);
    });
  }

  // A new card on the pile: bots holding the same card may jump in (spec §5.7).
  #planJumpIns(round: RoundState): void {
    const { cards, schedule, random } = this.#deps;
    const key = round.rules.jumpIn ? `${round.pile.length}|${round.deck.length}|${round.turn}` : null;

    if (key === this.#jumpKey) return;

    this.#cancelJumps();
    this.#jumpKey = key;

    if (key === null) return;

    round.seats.filter((seat) => seat !== round.turn && this.#isBot(seat)).forEach((seat) => {
      const delay = botJumpInDelay(cards.view(seat), cards.legal(seat), random);

      if (delay !== null) this.#jumps.set(seat, schedule(() => this.#jumpIn(seat), delay));
    });
  }

  #jumpIn(seat: string): void {
    const { cards, game, random } = this.#deps;

    this.#jumps.delete(seat);

    this.#safely(() => {
      const move = botMove('planner', cards.view(seat), cards.legal(seat), random);

      if (move?.type === 'play') game.botMove(seat, move);
    });
  }

  // A bot's move can come too late (the turn moved on, the round ended): that's fine.
  #safely(act: () => void): void {
    try {
      act();
    } catch (error) {
      if (!(error instanceof TableRoomError)) throw error;
    }

    this.#deps.changed();
  }

  #cancelJumps(): void {
    this.#jumps.forEach((cancel) => cancel());
    this.#jumps.clear();
  }
}
