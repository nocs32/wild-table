import { makeAutoObservable } from 'mobx';
import type { PreferencesService } from '../../../services';
import { UiWidgetsAreaStore } from './area';
import { UiWidgetsFrameStore } from './frame';

export interface UiWidgetsDeps {
  preferences: PreferencesService;
}

// Felt Table's floating widgets, here just the chat (spec §7): it floats over the game, bottom left,
// and starts closed (the table needs the room); the dock's chat button opens it and counts what
// you've missed.
export class UiWidgetsStore {
  readonly area = new UiWidgetsAreaStore();
  readonly chat: UiWidgetsFrameStore;

  constructor({ preferences }: UiWidgetsDeps) {
    this.chat = new UiWidgetsFrameStore(
      { key: 'chat', corner: 'bottomLeft', width: 340, height: 420, minWidth: 260, minHeight: 220, isOpenByDefault: false, aspect: () => null },
      this.area,
      preferences,
    );

    makeAutoObservable(this, { area: false, chat: false }, { autoBind: true });
  }

  get showsChat(): boolean {
    return this.area.isMeasured && this.chat.isOpen;
  }
}
