import type { Schedule } from '../types';

// Timers in named groups, so a whole group can be called off at once (a turn's plans when the turn
// ends, say). Everything is cancelled when the table closes.
export class DemoPlans<Group extends string> {
  readonly #schedule: Schedule;
  readonly #groups = new Map<Group, Array<() => void>>();

  constructor(schedule: Schedule) {
    this.#schedule = schedule;
  }

  later(group: Group, delayMs: number, action: () => void): void {
    const stop = this.#schedule(action, Math.max(0, delayMs));

    this.#groups.set(group, [...(this.#groups.get(group) ?? []), stop]);
  }

  cancel(group: Group): void {
    this.#groups.get(group)?.forEach((stop) => stop());
    this.#groups.delete(group);
  }

  cancelAll(): void {
    [...this.#groups.keys()].forEach((group) => this.cancel(group));
  }
}
