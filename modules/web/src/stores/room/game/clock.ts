import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../../services';

export interface RoomGameClockDeps {
  now: () => number;
  repeat: Schedule;
}

// How often the countdowns move on.
const tickMs = 250;

// The time, for the countdowns on screen (a turn's seconds, the next round's): stopped ⇄ ticking.
// It ticks only while there's something to count down.
export type RoomGameClockState = 'stopped' | 'ticking';

export class RoomGameClockStore {
  state: RoomGameClockState = 'stopped';
  now: number;
  #stop: (() => void) | null = null;
  readonly #deps: RoomGameClockDeps;

  constructor(deps: RoomGameClockDeps) {
    this.#deps = deps;
    this.now = deps.now();
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // Whole seconds left until `at`.
  secondsUntil(at: number | null): number {
    return at === null ? 0 : Math.max(0, Math.ceil((at - this.now) / 1000));
  }

  start(): void {
    if (this.state === 'ticking') return;

    this.state = 'ticking';
    this.tick();
    this.#stop = this.#deps.repeat(() => this.tick(), tickMs);
  }

  stop(): void {
    this.#stop?.();
    this.#stop = null;
    this.state = 'stopped';
  }

  tick(): void {
    this.now = this.#deps.now();
  }
}
