import { emoteLines, type EmoteLine, type TableEmoteEvent } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule, SoundsService } from '../../../services';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';

export interface RoomGameEmotesDeps {
  t: Translate;
  send: TableSend;
  schedule: Schedule;
  now: () => number;
  sounds: SoundsService;
}

export interface EmoteOptionView {
  line: EmoteLine;
  label: string;
}

// The table allows one emote every 3 seconds (spec §10.5).
const paceMs = 3000;
const bubbleMs = 2600;
// Each line pops up in a voice of its own: higher for a cheery hello, lower for a sly mwahaha.
const lineRates: Record<EmoteLine, number> = { hello: 1.08, wellPlayed: 1, oops: 1.2, sorry: 0.9, hurry: 1.3, mwahaha: 0.78 };

// Emotes (spec §7): click your own portrait for a wheel of lines, each shown as a speech bubble at
// your seat, with a pop. Click someone else's portrait to mute theirs. The wheel is closed ⇄ open.
export class RoomGameEmotesStore {
  state: 'closed' | 'open' = 'closed';
  // The line in each seat's speech bubble right now.
  bubbles = new Map<string, EmoteLine>();
  muted = new Set<string>();
  #sentAt = 0;
  readonly #deps: RoomGameEmotesDeps;

  constructor(deps: RoomGameEmotesDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isOpen(): boolean {
    return this.state === 'open';
  }

  get options(): EmoteOptionView[] {
    return emoteLines.map((line) => ({ line, label: this.#deps.t(`round.emotes.${line}`) }));
  }

  bubbleOf(seat: string): string {
    const line = this.bubbles.get(seat);

    return line ? this.#deps.t(`round.emotes.${line}`) : '';
  }

  isMuted(seat: string): boolean {
    return this.muted.has(seat);
  }

  muteLabel(seat: string, name: string): string {
    return this.#deps.t(this.isMuted(seat) ? 'round.emotes.unmute' : 'round.emotes.mute', { name });
  }

  setOpen(open: boolean): void {
    this.state = open ? 'open' : 'closed';
  }

  toggleMute(seat: string): void {
    const muted = new Set(this.muted);

    if (muted.has(seat)) muted.delete(seat);
    else muted.add(seat);

    this.muted = muted;
  }

  send(line: EmoteLine): void {
    this.state = 'closed';

    if (this.#deps.now() - this.#sentAt < paceMs) return;

    this.#sentAt = this.#deps.now();
    this.#deps.send('emote', { line });
  }

  receive({ seat, line }: TableEmoteEvent): void {
    if (this.muted.has(seat)) return;

    this.bubbles = new Map(this.bubbles).set(seat, line);
    this.#deps.sounds.play('pop', { rate: lineRates[line] });
    this.#deps.schedule(() => this.#fade(seat, line), bubbleMs);
  }

  #fade(seat: string, line: EmoteLine): void {
    if (this.bubbles.get(seat) !== line) return;

    const bubbles = new Map(this.bubbles);

    bubbles.delete(seat);
    this.bubbles = bubbles;
  }
}
