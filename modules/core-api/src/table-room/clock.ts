import type { Schedule } from './lifecycle.js';

export interface TableRoomClockDeps {
  schedule: Schedule;
  now: () => number;
}

// One deadline at a time: a turn's time (the fuse, spec D11) or the pause after a round. Setting a
// new one replaces the old. States: idle ⇄ running.
export class TableRoomClock {
  endsAt: number | null = null;
  #cancel: (() => void) | null = null;
  readonly #deps: TableRoomClockDeps;

  constructor(deps: TableRoomClockDeps) {
    this.#deps = deps;
  }

  start(delayMs: number, onEnd: () => void): void {
    this.stop();
    this.endsAt = this.#deps.now() + delayMs;

    this.#cancel = this.#deps.schedule(() => {
      this.endsAt = null;
      this.#cancel = null;
      onEnd();
    }, delayMs);
  }

  stop(): void {
    this.#cancel?.();
    this.#cancel = null;
    this.endsAt = null;
  }

  dispose(): void {
    this.stop();
  }
}
