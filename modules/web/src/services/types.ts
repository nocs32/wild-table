import type { TableErrorEvent, TableIntents, TableIntentType, TableReactionEvent, TableSnapshot } from '@wild-table/protocol';
import type { Language, TranslationKey, TranslationValues } from '../i18n';
import type { WidgetPreference } from '../stores/ui/widgets/types';

export interface SoundPreference {
  // 0–100.
  volume: number;
  muted: boolean;
}

// This browser's own settings, kept in localStorage.
export interface PreferencesService {
  loadLanguage: () => Language | null;
  saveLanguage: (language: Language) => void;
  loadName: () => string | null;
  saveName: (name: string) => void;
  loadSound: () => SoundPreference | null;
  saveSound: (sound: SoundPreference) => void;
  // Where the floating chat sits, and whether it's open.
  loadWidget: (key: string) => WidgetPreference | null;
  saveWidget: (key: string, preference: WidgetPreference) => void;
}

// The table's sounds (spec §7). For now just the chime; the cards, the bell and the room come with
// the game.
export interface SoundsService {
  chime: () => void;
  // 0 is silent, 1 is full volume.
  setLevel: (level: number) => void;
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
  schedule: Schedule;
  repeat: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
  origin: string;
  // The browser's languages, most preferred first (navigator.languages).
  browserLanguages: readonly string[];
}
