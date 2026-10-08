import type { EmoteLine, GamePhase, PlayEvent } from '@wild-table/protocol';
import { makeAutoObservable, runInAction } from 'mobx';
import { figureHats, playerPaint, type FigureDrawing, type FigureHat, type FigureMood } from '../../../art';
import type { Schedule } from '../../../services';
import type { MatchSeatView, RoomGameMatchStore } from './match';

export interface RoomGameMoodsDeps {
  match: RoomGameMatchStore;
  schedule: Schedule;
  phase: () => GamePhase;
}

// Another player's stick figure at the table, as drawn now. `key` changes whenever the drawing
// does; `reaction` whenever they react to something, so the figure can jump.
export interface FigureView {
  seat: string;
  angle: number;
  drawing: FigureDrawing;
  key: string;
  reaction: number;
}

interface Reaction {
  mood: FigureMood;
  id: number;
}

// How long a reaction shows before the figure goes back to watching the game.
const reactionMs = 3200;

const emoteMoods: Record<EmoteLine, FigureMood> = { hello: 'wave', wellPlayed: 'happy', oops: 'surprised', sorry: 'sad', hurry: 'angry', mwahaha: 'smug' };

// Where a seat is round the table, seen from your chair: x to the right, y away from you. Yours is
// at the bottom, the middle of the table at 0.
const spotOf = (angle: number): { x: number; y: number } => {
  const turn = (angle * Math.PI) / 180;

  return { x: -Math.sin(turn), y: -Math.cos(turn) };
};

// Eyes move in half steps, so a figure is redrawn only when its gaze really shifts.
const half = (value: number): number => Math.round(value * 2) / 2;

// The other players as stick figures (spec §8): each watches whoever's turn it is (you, when it's
// yours), thinks on their own turn, cheers when they win, and pulls a face at what happens to them,
// a +4, a Skip, the bell, an emote.
export class RoomGameMoodsStore {
  reactions = new Map<string, Reaction>();
  #next = 1;
  readonly #deps: RoomGameMoodsDeps;

  constructor(deps: RoomGameMoodsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get figures(): FigureView[] {
    const { match } = this.#deps;
    const people = match.seats.filter((seat) => !seat.isBot).map((seat) => seat.id);

    return match.others.map((seat) => {
      const reaction = this.reactions.get(seat.id);
      const mood = reaction?.mood ?? this.#baseMood(seat);
      const look = this.#lookOf(seat);
      const hat: FigureHat = seat.isBot ? 'propeller' : (figureHats[Math.max(0, people.indexOf(seat.id)) % figureHats.length] ?? 'cap');
      const drawing = { mood, look, hat, colour: playerPaint[seat.color] };

      return { seat: seat.id, angle: seat.angle, drawing, key: `${mood}|${look.x}|${look.y}|${hat}|${seat.color}`, reaction: reaction?.id ?? 0 };
    });
  }

  receive(events: readonly PlayEvent[]): void {
    events.forEach((event) => this.#react(event));
  }

  receiveEmote(seat: string, line: EmoteLine): void {
    this.#show(seat, emoteMoods[line]);
  }

  clear(): void {
    this.reactions = new Map();
  }

  #react(event: PlayEvent): void {
    switch (event.type) {
      case 'drew':
        return event.count >= 2 && event.reason === 'plus' ? this.#show(event.seat, 'sad') : undefined;
      case 'skipped':
        return this.#show(event.seat, 'surprised');
      case 'played':
        return this.#played(event);
      case 'challenged':
        this.#show(event.seat, event.bluff ? 'smug' : 'angry');

        return this.#show(event.against, event.bluff ? 'sad' : 'smug');
      case 'bell':
        this.#show(event.seat, 'smug');

        return event.hit.forEach((seat) => this.#show(seat, 'angry'));
      case 'swapped':
        this.#show(event.seat, 'happy');

        return this.#show(event.with, 'surprised');
      case 'roundOver':
        return this.clear();
      default:
        return undefined;
    }
  }

  // Slapping down a jump-in is a joy; a +2 or +4, a bit of mischief.
  #played({ seat, card, jumpIn }: Extract<PlayEvent, { type: 'played' }>): void {
    if (jumpIn) this.#show(seat, 'happy');
    else if (card.kind === 'wild4' || card.kind === 'draw2') this.#show(seat, 'smug');
  }

  #show(seat: string, mood: FigureMood): void {
    const id = this.#next++;

    this.reactions = new Map(this.reactions).set(seat, { mood, id });
    this.#deps.schedule(() => runInAction(() => this.#fade(seat, id)), reactionMs);
  }

  #fade(seat: string, id: number): void {
    if (this.reactions.get(seat)?.id !== id) return;

    const reactions = new Map(this.reactions);

    reactions.delete(seat);
    this.reactions = reactions;
  }

  // When nothing's just happened to them: thinking on their own turn, grinning on one card,
  // cheering a win, glum when someone else won.
  #baseMood(seat: MatchSeatView): FigureMood {
    const { match, phase } = this.#deps;

    if (phase() === 'podium') return match.snapshot?.champion === seat.id ? 'cheer' : 'idle';

    if (phase() === 'roundOver') return match.snapshot?.result?.winner === seat.id ? 'cheer' : 'sad';

    if (seat.isTurn) return 'thinking';

    return seat.isOnLastCard ? 'happy' : 'idle';
  }

  // Eyes on whoever's turn it is (on the pile when it's their own), or on the winner.
  #lookOf(seat: MatchSeatView): { x: number; y: number } {
    const { match, phase } = this.#deps;
    const snapshot = match.snapshot;
    const watched = phase() === 'podium' ? snapshot?.champion : phase() === 'roundOver' ? snapshot?.result?.winner : match.round?.turn;
    const target = match.seat(watched ?? null);
    const from = spotOf(seat.angle);
    const to = !target || target.id === seat.id ? { x: 0, y: 0 } : spotOf(target.angle);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;

    return { x: half(dx / length), y: half(dy / length) };
  }
}
