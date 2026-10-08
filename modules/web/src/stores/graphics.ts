import { makeAutoObservable } from 'mobx';
import type { GraphicsPreference, PreferencesService } from '../services';
import type { Translate } from './locale';

export interface GraphicsDeps {
  t: Translate;
  preferences: PreferencesService;
  now: () => number;
  // Tells the table, in a line over it, why the graphics just changed.
  notify: (text: string) => void;
}

// The first seconds after the page loads stutter anyway (textures going up to the graphics card):
// they don't count.
const settleMs = 6000;

// The 3D table's graphics (spec §8.3): full (shadows, glow, a sharp picture) or lighter (none of
// those), for weak laptops and phones. 'auto' starts full and goes lighter by itself if the frame
// rate drops; the switch sets it by hand. Saved in this browser.
export class GraphicsStore {
  mode: GraphicsPreference;
  // In 'auto': the frame rate dropped, so it's lighter now.
  dropped = false;
  readonly #startedAt: number;
  readonly #deps: GraphicsDeps;

  constructor(deps: GraphicsDeps) {
    this.#deps = deps;
    this.mode = deps.preferences.loadGraphics() ?? 'auto';
    this.#startedAt = deps.now();
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isLight(): boolean {
    return this.mode === 'light' || (this.mode === 'auto' && this.dropped);
  }

  setLight(light: boolean): void {
    this.mode = light ? 'light' : 'full';
    this.#deps.preferences.saveGraphics(this.mode);
  }

  // The frame rate dropped for a while (the 3D table measures it).
  drop(): void {
    if (this.mode !== 'auto' || this.dropped || this.#deps.now() - this.#startedAt < settleMs) return;

    this.dropped = true;
    this.#deps.notify(this.#deps.t('graphics.dropped'));
  }
}
