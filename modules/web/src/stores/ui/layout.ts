import { makeAutoObservable } from 'mobx';

// wide ⇄ compact: a phone held sideways (or a small window) is compact, and the lobby stacks its
// cards in one column beside the table instead of one on each side (spec D20, §9.2).
export type UiLayoutState = 'wide' | 'compact';

export class UiLayoutStore {
  state: UiLayoutState = 'wide';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isCompact(): boolean {
    return this.state === 'compact';
  }

  setCompact(compact: boolean): void {
    this.state = compact ? 'compact' : 'wide';
  }
}
