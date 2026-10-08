import { personNameMaxLength } from '@wild-table/protocol';
import { languages, type Language } from '../i18n';
import type { WidgetFrame, WidgetPreference } from '../stores/ui/widgets/types';
import type { GraphicsPreference, PreferencesService, SoundPreference } from './types';

const languageKey = 'wild-table:language';
const nameKey = 'wild-table:name';
const soundKey = 'wild-table:sound';
const graphicsKey = 'wild-table:graphics';
const graphicsChoices: readonly GraphicsPreference[] = ['auto', 'full', 'light'];
const widgetKey = (key: string): string => `wild-table:widget:${key}`;

const read = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked (private mode, site data off); preferences then just don't persist.
  }
};

const parse = (text: string | null): unknown => {
  try {
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isLanguage = (value: string | null): value is Language =>
  value !== null && (languages as readonly string[]).includes(value);

const toName = (value: string | null): string | null => {
  const name = value?.trim().slice(0, personNameMaxLength);

  return name ? name : null;
};

// Stored as "on:60" or "off:60".
const toSound = (value: string | null): SoundPreference | null => {
  const match = /^(on|off):(\d{1,3})$/u.exec(value ?? '');

  return match ? { muted: match[1] === 'off', volume: Math.min(100, Number(match[2])) } : null;
};

const toFrame = (value: unknown): WidgetFrame | null => {
  if (!isRecord(value)) return null;

  const { x, y, width, height } = value;

  return isFiniteNumber(x) && isFiniteNumber(y) && isFiniteNumber(width) && isFiniteNumber(height) ? { x, y, width, height } : null;
};

// Stored JSON can be stale or hand-edited: anything malformed falls back to the defaults.
const toWidgetPreference = (value: unknown): WidgetPreference | null =>
  isRecord(value) && typeof value.isOpen === 'boolean' ? { isOpen: value.isOpen, frame: toFrame(value.frame) } : null;

export const createPreferences = (): PreferencesService => ({
  loadLanguage: () => {
    const value = read(languageKey);

    return isLanguage(value) ? value : null;
  },
  saveLanguage: (language) => write(languageKey, language),
  loadName: () => toName(read(nameKey)),
  saveName: (name) => write(nameKey, name),
  loadSound: () => toSound(read(soundKey)),
  saveSound: (sound) => write(soundKey, `${sound.muted ? 'off' : 'on'}:${sound.volume}`),
  loadGraphics: () => graphicsChoices.find((choice) => choice === read(graphicsKey)) ?? null,
  saveGraphics: (graphics) => write(graphicsKey, graphics),
  loadWidget: (key) => toWidgetPreference(parse(read(widgetKey(key)))),
  saveWidget: (key, preference) => write(widgetKey(key), JSON.stringify(preference)),
});
