import { createServices } from '../services';
import type { Services } from '../services/types';
import { ArtStore } from './art';
import { LocaleStore } from './locale';
import { RoomStore } from './room';
import { RuleBookStore } from './rule-book';
import { SoundStore } from './sound';
import { TableStore } from './table';
import { UiStore } from './ui';

export class RootStore {
  readonly locale: LocaleStore;
  readonly ui: UiStore;
  readonly art: ArtStore;
  readonly room: RoomStore;
  readonly ruleBook: RuleBookStore;
  readonly sound: SoundStore;
  readonly table: TableStore;

  constructor(services: Services) {
    this.locale = new LocaleStore(services);
    this.ui = new UiStore(services);
    this.art = new ArtStore(services.cardArt);
    this.room = new RoomStore(services, this.locale, this.ui, this.art);
    this.ruleBook = new RuleBookStore({ t: this.locale.t, art: this.art, settings: this.room.game.settings, device: services.device });
    this.sound = new SoundStore({ t: this.locale.t, sounds: services.sounds, preferences: services.preferences });
    this.table = new TableStore({ t: this.locale.t, random: services.random, schedule: services.schedule, now: services.now, sounds: services.sounds, game: this.room.game });
  }
}

export const createRootStore = (): RootStore => new RootStore(createServices());
