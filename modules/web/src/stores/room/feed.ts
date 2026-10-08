import { chatMaxLength, type FeedEvent, type FeedItem } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Localizer, Translate } from '../locale';
import type { RoomPresenceStore } from './presence';
import type { PlayerColor } from './types';

export interface FeedEntry {
  id: string;
  kind: FeedItem['kind'];
  text: string;
  authorName: string;
  authorInitial: string;
  authorColor: PlayerColor;
  timeLabel: string;
  startsGroup: boolean;
}

export interface RoomFeedDeps {
  presence: RoomPresenceStore;
  locale: Localizer;
  send: (text: string) => void;
  // Takes a slot for one line; false when you're chatting faster than the table takes lines.
  takeTurn: () => boolean;
  // Lines that arrive while the chat is open are read at once.
  isOpen: () => boolean;
}

const groupWindowMs = 5 * 60_000;

// Slack groups consecutive messages from one person within a few minutes under one header.
const isGroupStart = (item: FeedItem, previous: FeedItem | undefined): boolean =>
  item.kind === 'system' || previous?.kind !== 'message' || previous.authorId !== item.authorId || item.at - previous.at > groupWindowMs;

const describe = (event: FeedEvent, t: Translate): string => {
  switch (event.type) {
    case 'renamed':
      return t('feed.renamed', { name: event.name });
    case 'setting':
      return t(`feed.setting.${event.setting}`, { value: event.value });
    case 'houseRule':
      return t(event.on ? 'feed.houseRuleOn' : 'feed.houseRuleOff', { rule: t(`houseRules.${event.rule}.name`) });
    case 'botAdded':
    case 'botRemoved':
      return t(`feed.${event.type}`, { name: event.name });
    default:
      return t(`feed.${event.type}`);
  }
};

// Chat messages and system lines from the table, newest last, the composer draft, and how many
// messages came in while the chat was closed (the badge on the chat button).
export class RoomFeedStore {
  items: FeedItem[] = [];
  draft = '';
  // The newest line already read; null before the first lines arrive.
  readUpTo: string | null = null;
  readonly #deps: RoomFeedDeps;

  constructor(deps: RoomFeedDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get entries(): FeedEntry[] {
    return this.items.map((item, index) => this.#toEntry(item, this.items[index - 1]));
  }

  // Other people's messages since the chat was last open.
  get unreadCount(): number {
    const from = this.items.findIndex((item) => item.id === this.readUpTo) + 1;

    return this.items.slice(from).filter((item) => item.kind === 'message' && item.authorId !== this.#deps.presence.meId).length;
  }

  get unreadLabel(): string {
    return this.unreadCount > 9 ? '9+' : String(this.unreadCount);
  }

  get canSend(): boolean {
    return this.draft.trim().length > 0;
  }

  get isDraftEmpty(): boolean {
    return !this.canSend;
  }

  get maxLength(): number {
    return chatMaxLength;
  }

  // What was here before you arrived isn't unread.
  receive(items: FeedItem[]): void {
    const isFirst = this.readUpTo === null;

    this.items = items;

    if (isFirst || this.#deps.isOpen()) this.markRead();
  }

  markRead(): void {
    this.readUpTo = this.items.at(-1)?.id ?? this.readUpTo;
  }

  setDraft(draft: string): void {
    this.draft = draft.slice(0, chatMaxLength);
  }

  // The message shows once the table has added it to the feed. Too fast, and it stays in the box.
  send(): void {
    const text = this.draft.trim();

    if (!text || !this.#deps.takeTurn()) return;

    this.#deps.send(text);
    this.draft = '';
  }

  #toEntry(item: FeedItem, previous: FeedItem | undefined): FeedEntry {
    const { locale, presence } = this.#deps;
    // Someone still at the table shows as they are right now; someone who left, as the line kept them.
    const author = presence.find(item.authorId);
    const authorName = author?.name ?? item.authorName;

    return {
      id: item.id,
      kind: item.kind,
      text: item.kind === 'message' ? item.text : describe(item.event, locale.t),
      authorName: authorName || locale.t('chat.someone'),
      authorInitial: authorName.charAt(0).toUpperCase() || '?',
      authorColor: author?.color ?? item.authorColor,
      timeLabel: locale.formatTime(item.at),
      startsGroup: isGroupStart(item, previous),
    };
  }
}
