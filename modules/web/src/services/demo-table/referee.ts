import { applySettings, changedSettings } from '@wild-table/engine';
import { chatMaxLength, cleanPersonName, defaultGameSettings, gameLimits, type GamePhase, type GameSettings, type TableIntents, type TableIntentType } from '@wild-table/protocol';
import type { TableLinkListeners } from '../types';
import { DemoBots } from './bots';
import { DemoFeed } from './feed';
import { demoHandlers, type DemoHandlers } from './intents';
import { nextBot } from './rules';
import type { DemoDeps, DemoMember, DemoTableState } from './types';
import { snapshotFor } from './view';

// Plays the server's part in the browser, with sample players (spec D18): who's at the table, the
// settings and the chat. The game itself comes later. The real server (core-api) takes over behind
// the same snapshots and intents.
export class DemoReferee implements DemoTableState {
  members: DemoMember[] = [];
  phase: GamePhase = 'lobby';
  settings: GameSettings = { ...defaultGameSettings };
  readonly #deps: DemoDeps;
  readonly #out: TableLinkListeners;
  readonly #feed: DemoFeed;
  readonly #bots: DemoBots;
  readonly #handlers: DemoHandlers;

  constructor(deps: DemoDeps, out: TableLinkListeners) {
    this.#deps = deps;
    this.#out = out;
    this.#feed = new DemoFeed(deps);
    this.#bots = new DemoBots(deps, { chat: (id, text) => this.chat(id, text) });
    this.#handlers = demoHandlers(this);
  }

  handle<T extends TableIntentType>(memberId: string, type: T, message: TableIntents[T]): void {
    (this.#handlers[type] as (memberId: string, message: TableIntents[T]) => void)(memberId, message);
  }

  join(member: DemoMember): void {
    this.members.push(member);
    this.#feed.system(member, { type: 'joined' });

    if (member.isBot) this.#bots.greet(member);

    this.#emit();
  }

  leave(memberId: string): void {
    const member = this.#member(memberId);

    if (!member) return;

    this.members = this.members.filter((other) => other !== member);
    this.#feed.system(member, { type: 'left' });
    this.#emit();
  }

  updateSettings(memberId: string, patch: Partial<GameSettings>): void {
    const author = this.#member(memberId);

    if (this.phase !== 'lobby' || !author) return;

    const next = applySettings(this.settings, patch);

    changedSettings(this.settings, next).forEach((setting) => this.#feed.system(author, { type: 'setting', setting, value: next[setting] }));
    this.settings = next;
    this.#emit();
  }

  chat(memberId: string, text: string): void {
    const author = this.#member(memberId);
    const clean = text.trim().slice(0, chatMaxLength);

    if (!author || !clean) return;

    this.#feed.message(author, clean);
    this.#emit();
  }

  rename(memberId: string, name: string): void {
    const member = this.#member(memberId);
    const clean = cleanPersonName(name);

    if (!member || !clean || clean === member.name) return;

    member.name = clean;
    this.#feed.system(member, { type: 'renamed', name: clean });
    this.#emit();
  }

  // Demo buttons.
  addBot(): void {
    const bot = nextBot(this.members, this.#deps.createId);

    if (bot && this.members.length < gameLimits.maxPlayers) this.join(bot);
  }

  removeBot(): void {
    const bot = this.members.findLast((member) => member.isBot);

    if (bot) this.leave(bot.id);
  }

  dispose(): void {
    this.#bots.cancel();
  }

  #member(id: string): DemoMember | undefined {
    return this.members.find((member) => member.id === id);
  }

  #emit(): void {
    this.#out.snapshot(snapshotFor(this, this.#feed));
  }
}
