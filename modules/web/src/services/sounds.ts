import type { SoundCue, SoundPlay, SoundsService } from './types';

// The game's cues (spec §7): the turn's chime, the cards (a slap on the pile, a deal, a riffle),
// the Last card! bell, the fuse, the pinball machine's jackpot, and the props you poke.
export const soundCues = ['chime', 'slap', 'deal', 'shuffle', 'bell', 'fuse', 'jackpot', 'creak', 'bubbles', 'button', 'box'] as const;

export type SoundUrls = Record<SoundCue, string>;

// Each cue's own level, so they sit together at one volume.
const cueLevels: Record<SoundCue, number> = {
  chime: 0.7,
  slap: 0.95,
  deal: 0.5,
  shuffle: 0.55,
  bell: 0.75,
  fuse: 0.3,
  jackpot: 0.6,
  creak: 0.55,
  bubbles: 0.55,
  button: 0.8,
  box: 0.7,
};

interface Voice {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

// A recording played from now, at `level` and `rate` (a higher rate plays it higher and shorter).
const start = (context: BaseAudioContext, buffer: AudioBuffer, destination: AudioNode, level: number, rate: number, loop: boolean): Voice => {
  const source = context.createBufferSource();
  const gain = context.createGain();

  source.buffer = buffer;
  source.loop = loop;
  source.playbackRate.value = rate;
  gain.gain.value = level;
  source.connect(gain).connect(destination);
  source.start();

  return { source, gain };
};

// Everything the table plays, from short CC0 recordings. Browsers allow audio only after a click
// or a key press on the page, so it starts (and loads them) on the first one; until then it's quiet.
export class Sounds implements SoundsService {
  #context: AudioContext | null = null;
  #master: GainNode | null = null;
  #cues: Record<SoundCue, AudioBuffer> | null = null;
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

  play(cue: SoundCue, { level = 1, rate = 1 }: SoundPlay = {}): void {
    const context = this.#running();

    if (context && this.#cues && this.#master) start(context, this.#cues[cue], this.#master, cueLevels[cue] * level, rate, false);
  }

  // Plays a cue over and over until the returned function stops it, with a short fade.
  loop(cue: SoundCue, { level = 1, rate = 1 }: SoundPlay = {}): () => void {
    const context = this.#running();

    if (!context || !this.#cues || !this.#master) return () => undefined;

    const voice = start(context, this.#cues[cue], this.#master, cueLevels[cue] * level, rate, true);

    return () => {
      voice.gain.gain.setTargetAtTime(0, context.currentTime, 0.05);
      voice.source.stop(context.currentTime + 0.3);
    };
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
    const cues = await Promise.all(soundCues.map(async (name) => [name, await decode(this.#urls[name])] as const));

    this.#cues = Object.fromEntries(cues) as Record<SoundCue, AudioBuffer>;
  }
}
