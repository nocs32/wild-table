import type { Services } from '../../services';
import { UiLayoutStore } from './layout';
import { UiWidgetsStore } from './widgets';

// This browser's own UI state: never shared with the table.
export class UiStore {
  readonly widgets: UiWidgetsStore;
  readonly layout = new UiLayoutStore();

  constructor(services: Services) {
    this.widgets = new UiWidgetsStore({ preferences: services.preferences });
  }
}
