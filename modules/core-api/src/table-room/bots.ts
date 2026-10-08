import { gameLimits } from '@wild-table/protocol';
import { TableRoomError } from './error.js';
import type { TableRoomFeed } from './feed.js';
import type { TableRoomGame } from './game.js';
import type { TableRoomMember, TableRoomMembers } from './members.js';

export interface TableRoomBotsDeps {
  members: TableRoomMembers;
  feed: TableRoomFeed;
  game: Pick<TableRoomGame, 'phase'>;
  createId: () => string;
}

// The bots (spec D9, §6). For now they only take seats in the lobby: anyone may sit one down in a
// free seat or send one away, and a person who arrives at a full table takes the newest bot's
// seat. Playing their turns comes with the game (§6.1, layer 3).
export class TableRoomBots {
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

  // Someone is sitting down at a full table: the newest bot gets up for them.
  makeRoom(): void {
    const { members, feed } = this.#deps;
    const bot = members.newestBot;

    if (!bot || members.count < gameLimits.maxPlayers) return;

    members.leave(bot.id);
    feed.system(bot, { type: 'left' });
  }

  #checkLobby(): void {
    if (this.#deps.game.phase !== 'lobby') throw new TableRoomError('WRONG_PHASE');
  }
}
