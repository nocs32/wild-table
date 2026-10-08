import { personNameMaxLength, type TableErrorEvent, type TableReactionEvent, type TableSnapshot } from '@wild-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { DemoControls, Services } from '../../services';
import type { ArtStore } from '../art';
import type { LocaleStore, Translate } from '../locale';
import { NameFieldStore } from '../name-field';
import type { UiStore } from '../ui';
import { RoomChatPaceStore } from './chat-pace';
import { RoomConnectionStore } from './connection';
import { RoomFeedStore } from './feed';
import { RoomGameStore } from './game';
import { RoomPresenceStore } from './presence';
import { RoomReactionsStore } from './reactions';
import { RoomSeatsStore } from './seats';
import { RoomShareStore } from './share';
import type { TableSend } from './types';

// The table sends; the room hands it to its parts. Wrapped, because the room's actions are bound
// only once its constructor has run makeAutoObservable.
const createConnection = (room: RoomStore, services: Services, t: Translate): RoomConnectionStore =>
  new RoomConnectionStore({
    ...services,
    t,
    receivers: {
      snapshot: (snapshot) => room.receiveSnapshot(snapshot),
      reaction: (event) => room.receiveReaction(event),
      refused: (event) => room.receiveRefusal(event),
      play: (events) => room.game.receivePlay(events),
      peek: (event) => room.game.receivePeek(event),
      hover: (event) => room.game.receiveHover(event),
      emote: (event) => room.game.emotes.receive(event),
    },
  });

const createNameField = (room: RoomStore, t: Translate): NameFieldStore =>
  new NameFieldStore({
    read: () => room.presence.me?.name ?? '',
    write: (name) => room.rename(name),
    placeholder: () => t('people.namePlaceholder'),
    normalize: (text) => text.slice(0, personNameMaxLength),
    finish: (text) => text.trim().replace(/\s+/gu, ' '),
  });

// The table: its connection hands snapshots and reactions to the parts, and the parts send their
// intents back through it.
export class RoomStore {
  readonly connection: RoomConnectionStore;
  readonly presence: RoomPresenceStore;
  readonly game: RoomGameStore;
  readonly seats: RoomSeatsStore;
  readonly feed: RoomFeedStore;
  readonly chatPace: RoomChatPaceStore;
  readonly reactions: RoomReactionsStore;
  readonly share: RoomShareStore;
  readonly myNameField: NameFieldStore;
  readonly #services: Services;
  readonly #ui: UiStore;

  constructor(services: Services, locale: LocaleStore, ui: UiStore, art: ArtStore) {
    const { t } = locale;
    const send: TableSend = (type, message) => this.connection.link?.send(type, message);

    this.#services = services;
    this.#ui = ui;
    this.connection = createConnection(this, services, t);
    this.presence = new RoomPresenceStore({ t });

    this.game = new RoomGameStore({
      ...services,
      t,
      send,
      art,
      isTouch: services.device.isTouch,
      isLive: () => this.connection.state === 'live',
      members: () => this.presence.members,
    });

    this.seats = new RoomSeatsStore({ t, presence: this.presence, send, isLobby: () => this.game.state === 'lobby' });
    this.chatPace = new RoomChatPaceStore({ t, now: services.now, schedule: services.schedule });

    this.feed = new RoomFeedStore({
      presence: this.presence,
      locale,
      send: (text) => send('chat', { text }),
      takeTurn: () => this.chatPace.take(),
      isOpen: () => ui.widgets.chat.isOpen,
    });

    this.reactions = new RoomReactionsStore({ ...services, t, send: (emoji) => send('react', { emoji }) });
    this.share = new RoomShareStore({ ...services, roomId: () => this.connection.roomId, t });
    this.myNameField = createNameField(this, t);
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isOpen(): boolean {
    return this.connection.isOpen;
  }

  // Only the demo table has these.
  get demo(): DemoControls | null {
    return this.connection.link?.demo ?? null;
  }

  open(): void {
    this.connection.open();
  }

  toggleChat(): void {
    this.#ui.widgets.chat.toggle();

    if (this.#ui.widgets.chat.isOpen) this.feed.markRead();
  }

  receiveSnapshot(snapshot: TableSnapshot): void {
    this.presence.receive(snapshot.members, this.connection.meId);
    this.game.receive(snapshot.game, snapshot.hand, this.connection.meId);
    this.feed.receive(snapshot.feed);
  }

  // A chat line the table turned down for coming too fast gets a note, instead of vanishing.
  receiveRefusal(event: TableErrorEvent): void {
    if (event.type === 'chat' && event.code === 'RATE_LIMITED') this.chatPace.refuse();

    this.game.receiveRefusal(event.type, event.code);
  }

  receiveReaction(event: TableReactionEvent): void {
    this.reactions.receive(event.emoji, event.memberId, this.presence.find(event.memberId)?.name ?? '');
  }

  rename(name: string): void {
    const me = this.presence.me;

    if (!me) return;

    this.presence.rename(me.id, name);
    this.#services.preferences.saveName(name);
    this.connection.link?.send('rename', { name });
  }
}
