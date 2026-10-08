import type { CardFace } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { CardArtService } from '../services';

// loading → ready: the cards are drawn once their typeface is in (spec §8.4). Until then, card
// images show as blanks.
export type ArtState = 'loading' | 'ready';

export class ArtStore {
  state: ArtState = 'loading';
  readonly #cardArt: CardArtService;

  constructor(cardArt: CardArtService) {
    this.#cardArt = cardArt;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isReady(): boolean {
    return this.state === 'ready';
  }

  // Started once in index.tsx. If the typeface fails to load, the cards are drawn anyway.
  load(): void {
    this.#cardArt.load().then(this.markReady, this.markReady);
  }

  markReady(): void {
    this.state = 'ready';
  }

  faceUrl(face: CardFace): string | null {
    return this.isReady ? this.#cardArt.faceUrl(face) : null;
  }

  backUrl(): string | null {
    return this.isReady ? this.#cardArt.backUrl() : null;
  }

  faceCanvas(face: CardFace): HTMLCanvasElement | null {
    return this.isReady ? this.#cardArt.faceCanvas(face) : null;
  }

  backCanvas(): HTMLCanvasElement | null {
    return this.isReady ? this.#cardArt.backCanvas() : null;
  }
}
