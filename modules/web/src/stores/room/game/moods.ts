import { playerColors, type EmoteLine, type GamePhase, type MemberSnapshot, type PlayEvent, type PlayerColor } from '@wild-table/protocol';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { figureHats, playerPaint, type FigureDrawing, type FigureHat, type FigureMood } from '../../../art';
import type { Schedule } from '../../../services';
import { figureSide, lobbySpot, lobbySpots, seatSpot } from '../../table/round/figures';
import type { MatchSeatView, RoomGameMatchStore } from './match';

export interface RoomGameMoodsDeps {
  match: RoomGameMatchStore;
  schedule: Schedule;
  phase: () => GamePhase;
  random: () => number;
  // Everyone at the table, in the order they joined.
  members: () => readonly MemberSnapshot[];
}

// Another player's stick figure at the table, as drawn now. `key` changes whenever the drawing
// does; `reaction` whenever they react to something, so the figure can jump. `isTurn`: it's their
// turn, and they light up; `isHolding`: their `cards` are up in their hands. `glances`: which way
// to look to see each of the others at the table, you too; `you`: which way to look at you.
export interface FigureView {
  seat: string;
  angle: number;
  // Where it stands: its feet, in the lobby on the floor at its spot, in a round at its seat.
  spot: [number, number, number];
  drawing: FigureDrawing;
  key: string;
  reaction: number;
  isTurn: boolean;
  isHolding: boolean;
  cards: number;
  glances: Array<{ x: number; y: number }>;
  you: { x: number; y: number } | null;
}

interface Reaction {
  mood: FigureMood;
  id: number;
}

// How long a reaction shows before the figure goes back to watching the game.
const reactionMs = 3200;

const emoteMoods: Record<EmoteLine, FigureMood> = { hello: 'wave', wellPlayed: 'happy', oops: 'surprised', sorry: 'sad', hurry: 'angry', mwahaha: 'smug' };

// How the others take someone else's win: good sports clap, bad losers fume. Everyone at the table
// takes it differently, and differently from round to round.
const loserMoods: readonly FigureMood[] = ['clap', 'angry', 'frustrated', 'sad', 'surprised'];

// Getting hit: everyone takes a Skip, a +2 or +4, or the bell their own way, a different way each
// time.
const hitMoods = {
  skipped: ['surprised', 'angry', 'sad', 'frustrated'],
  plus: ['sad', 'angry', 'frustrated'],
  bell: ['angry', 'frustrated', 'surprised'],
} as const satisfies Record<string, readonly FigureMood[]>;

// The faces someone pulls at their own cards on their turn, by how many they hold: lots make them
// nervous, a few confident, though any face can come up.
const turnFaces = (cards: number): readonly FigureMood[] => {
  if (cards >= 7) return ['nervous', 'nervous', 'concentrate', 'thinking'];

  if (cards <= 2) return ['confident', 'confident', 'concentrate', 'thinking'];

  return ['concentrate', 'thinking', 'confident', 'nervous'];
};

// Where a seat is round the table, seen from your chair: x to the right, y away from you. Yours is
// at the bottom, the middle of the table at 0.
const spotOf = (angle: number): { x: number; y: number } => {
  const turn = (angle * Math.PI) / 180;

  return { x: -Math.sin(turn), y: -Math.cos(turn) };
};

// Each player's hat goes with their colour, so it's the same in the lobby and at the table, for
// everyone; bots wear the propeller beanie.
const hatOf = (color: PlayerColor, bot: boolean): FigureHat => (bot ? 'propeller' : (figureHats[playerColors.indexOf(color) % figureHats.length] ?? 'cap'));

// Eyes move in half steps, so a figure is redrawn only when its gaze really shifts.
const half = (value: number): number => Math.round(value * 2) / 2;

// Which way a figure at `seat` looks to see `target`: at the pile when that's itself, or nobody.
const toward = (seat: MatchSeatView, target: MatchSeatView | null): { x: number; y: number } => {
  const from = spotOf(seat.angle);
  const to = !target || target.id === seat.id ? { x: 0, y: 0 } : spotOf(target.angle);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;

  return { x: half(dx / length), y: half(dy / length) };
};

// The other players as stick figures (spec §8): each watches whoever's turn it is (you, when it's
// yours), holds their cards up on their own turn, cheers when they win, and pulls a face at what
// happens to them, a +4, a Skip, the bell, an emote.
export class RoomGameMoodsStore {
  reactions = new Map<string, Reaction>();
  // The face whoever's turn it is pulls at their cards, picked afresh each turn (see `turnFaces`).
  turnPose: FigureMood = 'thinking';
  #next = 1;
  readonly #deps: RoomGameMoodsDeps;

  constructor(deps: RoomGameMoodsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });

    reaction(
      () => deps.match.round?.turn,
      () => runInAction(() => (this.turnPose = this.#pick(turnFaces(deps.match.seats.find((seat) => seat.isTurn)?.cards ?? 5)))),
    );
  }

  // In the lobby, everyone who's joined, you too; in a round, the others at their seats.
  get figures(): FigureView[] {
    return this.#deps.phase() === 'lobby' ? this.#lobbyFigures() : this.#tableFigures();
  }

  #lobbyFigures(): FigureView[] {
    return this.#deps
      .members()
      .slice(0, lobbySpots.length)
      .map((member, index) => {
        const spot = lobbySpots[index];
        const reaction = this.reactions.get(member.id);
        const mood = reaction?.mood ?? spot?.mood ?? 'idle';
        const look = spot?.look ?? { x: 0, y: 0 };
        const hat = hatOf(member.color, member.bot);
        const drawing = { mood, look, hat, colour: playerPaint[member.color] };

        return { seat: member.id, angle: 0, spot: lobbySpot(index), drawing, key: `${mood}|${hat}|${member.color}`, reaction: reaction?.id ?? 0, isTurn: false, isHolding: false, cards: 0, glances: [], you: null };
      });
  }

  #tableFigures(): FigureView[] {
    const { match } = this.#deps;

    return match.others.map((seat) => {
      const reaction = this.reactions.get(seat.id);
      const mood = reaction?.mood ?? this.#baseMood(seat);
      const look = this.#lookOf(seat);
      const hat = hatOf(seat.color, seat.isBot && !seat.standIn);
      const mirrored = figureSide(seat.angle) < 0;
      const drawing = { mood, look, hat, colour: playerPaint[seat.color], mirrored };

      const isHolding = seat.isTurn && this.#deps.phase() === 'round';

      const glances = match.seats.filter((other) => other.id !== seat.id).map((other) => toward(seat, other));
      const you = match.me ? toward(seat, match.me) : null;

      return { seat: seat.id, angle: seat.angle, spot: seatSpot(seat.angle), drawing, key: `${mood}|${look.x}|${look.y}|${hat}|${seat.color}|${mirrored}`, reaction: reaction?.id ?? 0, isTurn: seat.isTurn, isHolding, cards: seat.cards, glances, you };
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
        return event.count >= 2 && event.reason === 'plus' ? this.#show(event.seat, this.#pick(hitMoods.plus)) : undefined;
      case 'skipped':
        return this.#show(event.seat, this.#pick(hitMoods.skipped));
      case 'played':
        return this.#played(event);
      case 'challenged':
        if (event.bluff) this.#gloat(event.seat);
        else this.#show(event.seat, 'angry');

        return event.bluff ? this.#show(event.against, 'sad') : this.#gloat(event.against);
      case 'bell':
        this.#gloat(event.seat);

        return event.hit.forEach((seat) => this.#show(seat, this.#pick(hitMoods.bell)));
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
    else if (card.kind === 'wild4' || card.kind === 'draw2') this.#gloat(seat);
  }

  // Getting one over on someone: a smug look, or every other time a raspberry.
  #gloat(seat: string): void {
    this.#show(seat, this.#next % 2 === 0 ? 'taunt' : 'smug');
  }

  #pick(moods: readonly FigureMood[]): FigureMood {
    return moods[Math.floor(this.#deps.random() * moods.length)] ?? 'surprised';
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
  // cheering a win, and taking someone else's win in their own way.
  #baseMood(seat: MatchSeatView): FigureMood {
    const { match, phase } = this.#deps;
    const winner = phase() === 'podium' ? match.snapshot?.champion : phase() === 'roundOver' ? match.snapshot?.result?.winner : undefined;

    if (winner !== undefined) return winner === seat.id ? this.#winnerMood() : this.#loserMood(seat.id, winner);

    if (seat.isTurn) return this.turnPose;

    return seat.isOnLastCard ? 'happy' : 'idle';
  }

  // A round's winner cheers, or every other round blows a raspberry at everyone; the match's
  // champion cheers.
  #winnerMood(): FigureMood {
    const { match, phase } = this.#deps;

    return phase() === 'roundOver' && (match.snapshot?.number ?? 0) % 2 === 0 ? 'taunt' : 'cheer';
  }

  // Each loser's reaction: dealt round the table from a list that starts somewhere new each round
  // (and at the podium), so no two take it the same way.
  #loserMood(seat: string, winner: string | null): FigureMood {
    const { match, phase } = this.#deps;
    const losers = match.seats.map((other) => other.id).filter((id) => id !== winner);
    const start = (match.snapshot?.number ?? 0) * 3 + (phase() === 'podium' ? 2 : 0);

    return loserMoods[(Math.max(0, losers.indexOf(seat)) + start) % loserMoods.length] ?? 'sad';
  }

  // Eyes on whoever's turn it is (on the pile when it's their own), or on the winner.
  #lookOf(seat: MatchSeatView): { x: number; y: number } {
    const { match, phase } = this.#deps;
    const snapshot = match.snapshot;
    const watched = phase() === 'podium' ? snapshot?.champion : phase() === 'roundOver' ? snapshot?.result?.winner : match.round?.turn;

    return toward(seat, match.seat(watched ?? null));
  }
}
