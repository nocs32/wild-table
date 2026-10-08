import type {
  CardFace,
  PlayEvent,
  TableEmoteEvent,
  TableErrorEvent,
  TableHoverEvent,
  TableIntents,
  TableIntentType,
  TablePeekEvent,
  TableReactionEvent,
  TableSnapshot,
} from '@wild-table/protocol';
import type { Language, TranslationKey, TranslationValues } from '../i18n';
import type { WidgetPreference } from '../stores/ui/widgets/types';
import type { soundCues } from './sounds';

export interface SoundPreference {
  // 0–100.
  volume: number;
  muted: boolean;
}

// The 3D table's graphics (spec §8.3): lighter by itself when the game stutters, or set by hand.
export type GraphicsPreference = 'auto' | 'full' | 'light';

// This browser's own settings, kept in localStorage.
export interface PreferencesService {
  loadLanguage: () => Language | null;
  saveLanguage: (language: Language) => void;
  loadName: () => string | null;
  saveName: (name: string) => void;
  loadSound: () => SoundPreference | null;
  saveSound: (sound: SoundPreference) => void;
  loadGraphics: () => GraphicsPreference | null;
  saveGraphics: (graphics: GraphicsPreference) => void;
  // Where the floating chat sits, and whether it's open.
  loadWidget: (key: string) => WidgetPreference | null;
  saveWidget: (key: string, preference: WidgetPreference) => void;
}

// The game's cues (spec §7), listed in services/sounds.ts.
export type SoundCue = (typeof soundCues)[number];

// How loud (0 to 1, on top of the cue's own level) and how high (1 as recorded).
export interface SoundPlay {
  level?: number;
  rate?: number;
}

// The table's sounds (spec §7): CC0 recordings, quiet until the page is first clicked.
export interface SoundsService {
  play: (cue: SoundCue, options?: SoundPlay) => void;
  // Plays it over and over until the returned function stops it.
  loop: (cue: SoundCue, options?: SoundPlay) => () => void;
  // 0 is silent, 1 is full volume.
  setLevel: (level: number) => void;
}

// The cards, drawn by code (spec §8.4).
export interface CardArtService {
  // Waits for the typeface the cards are lettered in. Nothing is drawn before it's done.
  load: () => Promise<void>;
  // An image URL for the HTML, drawn the first time it's asked for.
  faceUrl: (face: CardFace) => string;
  backUrl: () => string;
  // A canvas, for the 3D table's textures.
  faceCanvas: (face: CardFace) => HTMLCanvasElement;
  backCanvas: () => HTMLCanvasElement;
}

// What kind of pointer this device has: a mouse, or a finger (the rule book shows the touch
// versions of how to play a card).
export interface DeviceService {
  isTouch: () => boolean;
}

export interface TranslatorService {
  translate: (language: Language, key: TranslationKey, values?: TranslationValues) => string;
  formatTime: (language: Language, at: number) => string;
}

export interface ClipboardService {
  writeText: (text: string) => Promise<void>;
}

// Runs `callback` later (once, or on an interval) and returns a function that cancels it.
export type Schedule = (callback: () => void, delayMs: number) => () => void;

// The table's address: /r/:roomId.
export interface AddressService {
  roomId: () => string | null;
  showRoom: (roomId: string) => void;
  // Goes to `/`, which sets up a new table.
  startNew: () => void;
  reload: () => void;
}

export interface TableLinkListeners {
  snapshot: (snapshot: TableSnapshot) => void;
  // Someone else's reaction.
  reaction: (event: TableReactionEvent) => void;
  // What just happened at the table, in order (spec §10.2), sent before the snapshot it leads to.
  play: (events: PlayEvent[]) => void;
  // The hand you challenged, to you alone (spec §5.5).
  peek: (event: TablePeekEvent) => void;
  // Someone's pointer over a card in their hand, and someone's emote (spec §7, §8).
  hover: (event: TableHoverEvent) => void;
  emote: (event: TableEmoteEvent) => void;
  // The connection dropped (the table holds the seat for a while), or came back.
  connection: (state: TableConnectionState) => void;
  // The seat is gone for good: the table closed, or getting back in took too long.
  closed: () => void;
  // The table refused something this browser asked for.
  refused: (event: TableErrorEvent) => void;
}

export type TableConnectionState = 'live' | 'reconnecting';

// Why a table couldn't be opened: it was cleared, it's full, this web app is out of date, or the
// server can't be reached.
export type TableOpenFailure = 'gone' | 'full' | 'outdated' | 'unreachable';

export type TableOpenResult = { ok: true; link: TableLink } | { ok: false; failure: TableOpenFailure };

// Buttons for trying the game alone: only the demo table has them.
export interface DemoControls {
  addPlayer: () => void;
  removePlayer: () => void;
}

// An open table: who you are there, and a way to ask for things.
export interface TableLink {
  readonly roomId: string;
  readonly meId: string;
  readonly demo: DemoControls | null;
  send: <T extends TableIntentType>(type: T, message: TableIntents[T]) => void;
  close: () => void;
}

export interface TableClientService {
  // Joins the table at `roomId`, or sets up a new one when it's null.
  open: (roomId: string | null, name: string | null, listeners: TableLinkListeners) => Promise<TableOpenResult>;
}

// Everything stores need from the outside world, created once in index.tsx.
export interface Services {
  preferences: PreferencesService;
  translator: TranslatorService;
  clipboard: ClipboardService;
  address: AddressService;
  tableClient: TableClientService;
  sounds: SoundsService;
  cardArt: CardArtService;
  device: DeviceService;
  schedule: Schedule;
  repeat: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
  origin: string;
  // The browser's languages, most preferred first (navigator.languages).
  browserLanguages: readonly string[];
}
