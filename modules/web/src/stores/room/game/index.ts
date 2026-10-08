import type { GamePhase, GameSnapshot, HandSnapshot, MemberSnapshot, PlayEvent, TableErrorCode, TableHoverEvent, TableIntentType, TablePeekEvent } from '@wild-table/protocol';
import { makeAutoObservable, reaction } from 'mobx';
import type { Schedule, SoundsService } from '../../../services';
import type { ArtStore } from '../../art';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';
import { RoomGameCaptionsStore } from './captions';
import { RoomGameClockStore } from './clock';
import { RoomGameEmotesStore } from './emotes';
import { RoomGameHandStore } from './hand';
import { RoomGameMatchStore } from './match';
import { RoomGameResultStore } from './result';
import { RoomGameSettingsStore } from './settings';
import { RoomGameTurnStore } from './turn';

export interface RoomGameDeps {
  t: Translate;
  send: TableSend;
  art: ArtStore;
  schedule: Schedule;
  repeat: Schedule;
  now: () => number;
  isTouch: () => boolean;
  // Connected to the table: the turn's sounds stop while it's lost.
  isLive: () => boolean;
  members: () => readonly MemberSnapshot[];
  sounds: SoundsService;
}

// Refusals that mean the table moved on before a move got there (someone else was faster).
const lateCodes: ReadonlySet<TableErrorCode> = new Set(['NOT_YOUR_TURN', 'DOES_NOT_FIT', 'WRONG_STEP', 'NOT_IN_HAND']);

// Hears about what just happened at the table (the 3D table plays it), and about moves the table
// turned down (a card sent to the pile goes back to the hand).
export interface RoomGameListener {
  played: (events: readonly PlayEvent[]) => void;
  refused: (type: TableIntentType) => void;
}

// The game as you see it: its phase (the state: lobby → round → roundOver → … → podium), the
// settings, the match, your hand, the turn, the captions, the scores and the emotes. The table runs
// the game; this only shows it and asks.
export class RoomGameStore {
  state: GamePhase = 'lobby';
  readonly settings: RoomGameSettingsStore;
  readonly match: RoomGameMatchStore;
  readonly hand: RoomGameHandStore;
  readonly clock: RoomGameClockStore;
  readonly turn: RoomGameTurnStore;
  readonly captions: RoomGameCaptionsStore;
  readonly result: RoomGameResultStore;
  readonly emotes: RoomGameEmotesStore;
  #listeners: RoomGameListener[] = [];
  #stopFuse: (() => void) | null = null;
  readonly #send: TableSend;
  readonly #t: Translate;

  constructor(deps: RoomGameDeps) {
    const { t, send, art, schedule } = deps;
    const rules = (): RoomGameSettingsStore['houseRules'] => this.settings.houseRules;

    this.#send = send;
    this.#t = t;
    this.settings = new RoomGameSettingsStore({ t, send, isEditable: () => this.state === 'lobby' });
    this.match = new RoomGameMatchStore({ t, members: deps.members });
    this.clock = new RoomGameClockStore({ now: deps.now, repeat: deps.repeat });
    this.hand = new RoomGameHandStore({ t, send, match: this.match, clock: this.clock, rules, schedule });
    this.turn = new RoomGameTurnStore({ t, match: this.match, hand: this.hand, clock: this.clock, canChallenge: () => !rules().wild4AnyTime, isTouch: deps.isTouch });
    this.captions = new RoomGameCaptionsStore({ t, art, match: this.match, schedule, seatCount: () => this.match.seats.length, rules });
    this.result = new RoomGameResultStore({ t, art, send, match: this.match, clock: this.clock, targetScore: () => this.settings.targetScore });
    this.emotes = new RoomGameEmotesStore({ t, send, schedule, now: deps.now, sounds: deps.sounds });
    makeAutoObservable(this, {}, { autoBind: true });
    this.#listenForSounds(deps.sounds, deps.isLive);
    this.#introduceTheBell();
  }

  get isLobby(): boolean {
    return this.state === 'lobby';
  }

  get isPlaying(): boolean {
    return this.state === 'round';
  }

  receive(game: GameSnapshot, hand: HandSnapshot | null, meId: string): void {
    this.state = game.phase;
    this.settings.receive(game.settings);
    this.match.receive(game.match, meId);
    this.hand.receive(hand);

    if (game.phase === 'round' || game.phase === 'roundOver') this.clock.start();
    else this.clock.stop();

    if (game.phase === 'lobby') {
      this.captions.clear();
      this.emotes.setOpen(false);
    }
  }

  receivePlay(events: readonly PlayEvent[]): void {
    this.captions.receive(events);
    this.#listeners.forEach((listener) => listener.played(events));
  }

  // A move the table turned down: the card comes back, and a line says why (spec D7).
  receiveRefusal(type: TableIntentType, code: TableErrorCode): void {
    this.#listeners.forEach((listener) => listener.refused(type));
    this.captions.why(this.#refusalText(type, code));
  }

  receiveHover(event: TableHoverEvent): void {
    this.match.receiveHover(event);
  }

  receivePeek(event: TablePeekEvent): void {
    this.captions.receivePeek(event);
  }

  listen(listener: RoomGameListener): void {
    this.#listeners = [...this.#listeners, listener];
  }

  start(): void {
    if (this.state === 'lobby') this.#send('start', {});
  }

  // A click on someone's place card: on your 7 (the 7-0 rule), swap hands with them; otherwise
  // mute or unmute their emotes. Your own opens your emotes.
  pickSeat(seat: string): void {
    if (this.#isSwapping) this.hand.swap(seat);
    else this.emotes.toggleMute(seat);
  }

  seatHint(seat: string, name: string): string {
    return this.#isSwapping ? this.#t('round.seat.swap', { name }) : this.emotes.muteLabel(seat, name);
  }

  // The turn's sounds (spec §7): a chime when it's your turn, the fuse hissing while it burns, and
  // the pinball machine's jackpot when a round is won (and louder for the match).
  // The first time anyone's down to one card, a line says what the bell does.
  #introduceTheBell(): void {
    reaction(
      () => this.isPlaying && this.match.isBellLit,
      (lit) => lit && this.captions.introduceBell(),
    );
  }

  #listenForSounds(sounds: SoundsService, isLive: () => boolean): void {
    reaction(
      () => this.isPlaying && this.match.isMyTurn,
      (mine) => mine && sounds.play('chime'),
    );

    reaction(
      () => this.isPlaying && this.turn.isBurning && isLive(),
      (burning) => {
        this.#stopFuse?.();
        this.#stopFuse = burning ? sounds.loop('fuse') : null;
      },
    );

    reaction(
      () => this.state,
      (state) => {
        if (state === 'roundOver') sounds.play('jackpot', { level: 0.55 });
        else if (state === 'podium') sounds.play('jackpot');
      },
    );
  }

  #refusalText(type: TableIntentType, code: TableErrorCode): string {
    const t = this.#t;

    if (code === 'BELL_USED') return t('round.refused.bellUsed');

    if (code === 'NO_TARGET') return t('round.refused.noTarget');

    return lateCodes.has(code) && type !== 'hover' ? t('round.refused.late') : '';
  }

  get #isSwapping(): boolean {
    return this.match.isMyTurn && this.match.round?.step === 'swap';
  }
}
