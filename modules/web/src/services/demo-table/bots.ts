import { DemoPlans } from './plans';
import type { DemoDeps, DemoMember } from './types';

// What sample players can do at the table: the same things people do.
export interface DemoBotsHost {
  chat: (memberId: string, text: string) => void;
}

// What sample players type in the chat: their own words, not UI text, so it isn't translated.
const greetings = { en: ['hey all 👋', 'hi! ready when you are'], uk: ['привіт усім 👋', 'всім привіт!'] };

// Sample players: for now they sit down and say hello. They play cards once there's a game, as the
// bots do (spec §6.1).
export class DemoBots {
  readonly #deps: DemoDeps;
  readonly #host: DemoBotsHost;
  readonly #plans: DemoPlans<'chat'>;

  constructor(deps: DemoDeps, host: DemoBotsHost) {
    this.#deps = deps;
    this.#host = host;
    this.#plans = new DemoPlans(deps.schedule);
  }

  cancel(): void {
    this.#plans.cancelAll();
  }

  greet(bot: DemoMember): void {
    this.#plans.later('chat', 1200 + this.#deps.random() * 2500, () => this.#host.chat(bot.id, this.#pick(greetings[bot.language])));
  }

  #pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.#deps.random() * items.length)] as T;
  }
}
