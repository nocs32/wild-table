import { applySettings, settingChanges, type Move } from '@wild-table/engine';
import {
  chatMaxLength,
  cleanPersonName,
  defaultGameSettings,
  gameLimits,
  type EmoteLine,
  type FeedEvent,
  type GamePhase,
  type GameSettings,
  type GameSettingsPatch,
  type TableErrorCode,
  type TableIntents,
  type TableIntentType,
} from '@wild-table/protocol';
import type { TableLinkListeners } from '../types';
import { DemoBots } from './bots';
import { DemoFeed } from './feed';
import { demoHandlers, type DemoHandlers } from './intents';
import { DemoMatch } from './match';
import { DemoPlayers } from './players';
import { newBot, nextSample } from './rules';
import type { DemoDeps, DemoMember, DemoTableState } from './types';
import { snapshotFor } from './view';

// Plays the server's part in the browser, with sample players (spec D18): who's at the table, the
// bots, the settings, the chat, and the match itself, with the engine's rules and bots. The real
// server (core-api) takes over behind the same snapshots, events and intents, with the same rules:
// bots sit only in free seats, someone arriving at a full table takes the newest bot's seat, and
// here every seat but yours is played by the planning bot.
export class DemoReferee implements DemoTableState {
  members: DemoMember[] = [];
  settings: GameSettings = { ...defaultGameSettings };
  readonly #deps: DemoDeps;
  readonly #out: TableLinkListeners;
  readonly #meId: string;
  readonly #feed: DemoFeed;
  readonly #bots: DemoBots;
  readonly #match: DemoMatch;
  readonly #players: DemoPlayers;
  readonly #handlers: DemoHandlers;

  constructor(deps: DemoDeps, out: TableLinkListeners, meId: string) {
    this.#deps = deps;
    this.#out = out;
    this.#meId = meId;
    this.#feed = new DemoFeed(deps);
    this.#bots = new DemoBots(deps, { chat: (id, text) => this.chat(id, text) });

    this.#match = new DemoMatch(deps, {
      members: () => this.members,
      settings: () => this.settings,
      system: (id, event) => this.#system(id, event),
      changed: () => this.#changed(),
    });

    this.#players = new DemoPlayers(deps, {
      match: this.#match,
      isBot: (seat) => this.#isBot(seat),
      isStandIn: (seat) => seat === this.#meId && this.#match.record.standIns.has(seat),
      moved: () => this.#changed(),
    });

    this.#handlers = demoHandlers(this);
  }

  get phase(): GamePhase {
    return this.#match.phase;
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
    this.#match.leave(memberId);
    this.#feed.system(member, { type: 'left' });
    this.#changed();
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

  start(memberId: string): void {
    this.#refuse('start', this.#match.start(memberId));
    this.#changed();
  }

  move(memberId: string, type: TableIntentType, move: Move, strength = 0.5): void {
    this.#refuse(type, this.#match.move(memberId, move, strength, true));
    this.#changed();
  }

  // Your emote, back to you: the sample players don't answer yet.
  emote(memberId: string, line: EmoteLine): void {
    if (this.#match.record.isSeated(memberId)) this.#out.emote({ seat: memberId, line });
  }

  nextRound(): void {
    this.#match.nextRound();
    this.#changed();
  }

  playAgain(): void {
    this.#match.playAgain();
    this.#changed();
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
    this.#players.cancel();
    this.#match.dispose();
  }

  // Someone is sitting down at a full table in the lobby: the newest bot gets up for them.
  #makeRoom(): void {
    const bot = this.members.findLast((member) => member.bot);

    if (this.#isFull && bot && this.phase === 'lobby') this.leave(bot.id);
  }

  #member(id: string): DemoMember | undefined {
    return this.members.find((member) => member.id === id);
  }

  // Every seat but yours, and yours while a bot stands in for you.
  #isBot(seat: string): boolean {
    return seat !== this.#meId || this.#match.record.standIns.has(seat);
  }

  #system(memberId: string, event: FeedEvent): void {
    const author = this.#member(memberId);

    if (author) this.#feed.system(author, event);
  }

  #refuse(type: TableIntentType, code: TableErrorCode | null): void {
    if (code !== null) this.#out.refused({ type, code });
  }

  // After every change: the bots plan their moves, and you hear about it.
  #changed(): void {
    this.#players.drive();
    this.#emit();
  }

  // What happened first, then your peeks, then the table as it is now with your hand, in the order
  // the server's outbox sends them.
  #emit(): void {
    const { played, peeks } = this.#match.drain();

    if (played.length > 0) this.#out.play(played);

    peeks.filter((peek) => peek.to === this.#meId).forEach((peek) => this.#out.peek(peek.event));
    this.#out.snapshot(snapshotFor(this, this.#feed, this.#match.snapshot(), this.#match.hand(this.#meId)));
  }
}
