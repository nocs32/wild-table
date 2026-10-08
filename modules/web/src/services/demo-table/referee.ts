import { applySettings, settingChanges } from '@wild-table/engine';
import {
  chatMaxLength,
  cleanPersonName,
  defaultGameSettings,
  gameLimits,
  type GamePhase,
  type GameSettings,
  type GameSettingsPatch,
  type TableIntents,
  type TableIntentType,
} from '@wild-table/protocol';
import type { TableLinkListeners } from '../types';
import { DemoBots } from './bots';
import { DemoFeed } from './feed';
import { demoHandlers, type DemoHandlers } from './intents';
import { newBot, nextSample } from './rules';
import type { DemoDeps, DemoMember, DemoTableState } from './types';
import { snapshotFor } from './view';

// Plays the server's part in the browser, with sample players (spec D18): who's at the table, the
// bots, the settings and the chat. The game itself comes later. The real server (core-api) takes
// over behind the same snapshots and intents, with the same rules: bots sit only in free seats, and
// someone arriving at a full table takes the newest bot's seat.
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

  get #isFull(): boolean {
    return this.members.length >= gameLimits.maxPlayers;
  }

  handle<T extends TableIntentType>(memberId: string, type: T, message: TableIntents[T]): void {
    (this.#handlers[type] as (memberId: string, message: TableIntents[T]) => void)(memberId, message);
  }

  join(member: DemoMember): void {
    this.#makeRoom();
    this.members.push(member);
    this.#feed.system(member, { type: 'joined' });

    if (member.sample) this.#bots.greet(member);

    this.#emit();
  }

  leave(memberId: string): void {
    const member = this.#member(memberId);

    if (!member) return;

    this.members = this.members.filter((other) => other !== member);
    this.#feed.system(member, { type: 'left' });
    this.#emit();
  }

  updateSettings(memberId: string, patch: GameSettingsPatch): void {
    const author = this.#member(memberId);

    if (this.phase !== 'lobby' || !author) return;

    const next = applySettings(this.settings, patch);

    settingChanges(this.settings, next).forEach((change) => this.#feed.system(author, change));
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

  addBot(memberId: string): void {
    const author = this.#member(memberId);

    if (!author || this.phase !== 'lobby' || this.#isFull) return;

    const bot = newBot(this.members, this.#deps.createId);

    this.members.push(bot);
    this.#feed.system(author, { type: 'botAdded', name: bot.name });
    this.#emit();
  }

  removeBot(memberId: string, botId: string): void {
    const author = this.#member(memberId);
    const bot = this.#member(botId);

    if (!author || !bot?.bot || this.phase !== 'lobby') return;

    this.members = this.members.filter((other) => other !== bot);
    this.#feed.system(author, { type: 'botRemoved', name: bot.name });
    this.#emit();
  }

  // Demo buttons: a sample player sits down or gets up.
  addSample(): void {
    const sample = nextSample(this.members, this.#deps.createId);

    if (sample && (!this.#isFull || this.members.some((member) => member.bot))) this.join(sample);
  }

  removeSample(): void {
    const sample = this.members.findLast((member) => member.sample);

    if (sample) this.leave(sample.id);
  }

  dispose(): void {
    this.#bots.cancel();
  }

  // Someone is sitting down at a full table: the newest bot gets up for them.
  #makeRoom(): void {
    const bot = this.members.findLast((member) => member.bot);

    if (this.#isFull && bot) this.leave(bot.id);
  }

  #member(id: string): DemoMember | undefined {
    return this.members.find((member) => member.id === id);
  }

  #emit(): void {
    this.#out.snapshot(snapshotFor(this, this.#feed));
  }
}
