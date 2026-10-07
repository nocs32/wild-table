import type { SoundsService } from './types';

// The game's cues (spec §7). For now just a chime; the cards, the bell and the room come with the
// game, from CC0 recordings like this one.
const cueNames = ['chime'] as const;

type CueName = (typeof cueNames)[number];

export type SoundUrls = Record<CueName, string>;

const cueLevels: Record<CueName, number> = { chime: 0.7 };

// A recording played once from `at`, at `level`.
const playOnce = (context: BaseAudioContext, buffer: AudioBuffer, destination: AudioNode, at: number, level: number): void => {
  const source = context.createBufferSource();
  const gain = context.createGain();

  source.buffer = buffer;
  gain.gain.value = level;
  source.connect(gain).connect(destination);
  source.start(at);
};

// Everything the table plays, from short CC0 recordings. Browsers allow audio only after a click
// or a key press on the page, so it starts (and loads them) on the first one; until then it's quiet.
export class Sounds implements SoundsService {
  #context: AudioContext | null = null;
  #master: GainNode | null = null;
  #cues: Record<CueName, AudioBuffer> | null = null;
  #level = 0;
  readonly #urls: SoundUrls;

  constructor(target: Window, urls: SoundUrls) {
    this.#urls = urls;
    target.addEventListener('pointerdown', this.#unlock, true);
    target.addEventListener('keydown', this.#unlock, true);
  }

  setLevel(level: number): void {
    this.#level = level;

    const context = this.#context;

    if (!context || !this.#master) return;

    // Squared, so the slider feels even to the ear. Muted, the context sleeps.
    this.#master.gain.setTargetAtTime(level * level, context.currentTime, 0.05);
    void (level > 0 ? context.resume() : context.suspend());
  }

  chime(): void {
    this.#cue('chime');
  }

  #cue(name: CueName): void {
    const context = this.#running();

    if (context && this.#cues && this.#master) playOnce(context, this.#cues[name], this.#master, context.currentTime, cueLevels[name]);
  }

  // The context, when it runs and there's something to hear.
  #running(): AudioContext | null {
    return this.#level > 0 && this.#context?.state === 'running' ? this.#context : null;
  }

  readonly #unlock = (): void => {
    if (!this.#context) this.#start();

    if (this.#level > 0) void this.#context?.resume();
  };

  #start(): void {
    const context = new AudioContext();
    const master = context.createGain();

    master.gain.value = this.#level * this.#level;
    master.connect(context.destination);
    this.#context = context;
    this.#master = master;
    // Without the recordings (offline, say) the table just stays quiet.
    void this.#load(context).catch(() => undefined);
  }

  async #load(context: AudioContext): Promise<void> {
    const decode = async (url: string): Promise<AudioBuffer> => context.decodeAudioData(await (await fetch(url)).arrayBuffer());
    const cues = await Promise.all(cueNames.map(async (name) => [name, await decode(this.#urls[name])] as const));

    this.#cues = Object.fromEntries(cues) as Record<CueName, AudioBuffer>;
  }
}
