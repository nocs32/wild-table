import { cleanPersonName, playerColors, type PlayerColor } from '@wild-table/protocol';
import { TableRoomError } from './error.js';
import { pickMemberName } from './member-names.js';

// Someone at the table, keyed by their session id.
export interface TableRoomMember {
  readonly id: string;
  name: string;
  readonly color: PlayerColor;
  connected: boolean;
}

// Who is at the table, in the order they joined. Each member is connected ⇄ reconnecting (a
// dropped connection keeps its seat for a while), then leaves.
export class TableRoomMembers {
  readonly #members = new Map<string, TableRoomMember>();
  readonly #random: () => number;

  constructor(random: () => number) {
    this.#random = random;
  }

  // Everyone with a seat, reconnecting people included.
  get count(): number {
    return this.#members.size;
  }

  get all(): TableRoomMember[] {
    return [...this.#members.values()];
  }

  has(id: string): boolean {
    return this.#members.has(id);
  }

  find(id: string): TableRoomMember | undefined {
    return this.#members.get(id);
  }

  get(id: string): TableRoomMember {
    const member = this.#members.get(id);

    if (!member) throw new TableRoomError('NOT_A_MEMBER');

    return member;
  }

  isConnected(id: string): boolean {
    return this.#members.get(id)?.connected ?? false;
  }

  // `requestedName` is the name this person picked before; without one the table makes one up.
  join(id: string, requestedName: string | null): TableRoomMember {
    if (this.#members.has(id)) throw new TableRoomError('ALREADY_A_MEMBER');

    const name = cleanPersonName(requestedName ?? '') || pickMemberName(new Set(this.all.map((member) => member.name)), this.#random);
    const member: TableRoomMember = { id, name, color: this.#freeColor(), connected: true };

    this.#members.set(id, member);

    return member;
  }

  drop(id: string): void {
    this.get(id).connected = false;
  }

  reconnect(id: string): void {
    this.get(id).connected = true;
  }

  leave(id: string): TableRoomMember {
    const member = this.get(id);

    this.#members.delete(id);

    return member;
  }

  // Returns the cleaned-up name, or null when nothing changed.
  rename(id: string, text: string): string | null {
    const member = this.get(id);
    const name = cleanPersonName(text);

    if (!name) throw new TableRoomError('EMPTY_NAME');

    if (name === member.name) return null;

    member.name = name;

    return name;
  }

  // The least used colour (unused while there are fewer people than colours), random among ties.
  #freeColor(): PlayerColor {
    const uses = new Map<PlayerColor, number>(playerColors.map((color) => [color, 0]));

    this.#members.forEach((member) => uses.set(member.color, (uses.get(member.color) ?? 0) + 1));

    const fewest = Math.min(...uses.values());
    const candidates = playerColors.filter((color) => uses.get(color) === fewest);

    return candidates[Math.floor(this.#random() * candidates.length)] ?? 'teal';
  }
}
