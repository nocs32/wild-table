import { isWild, type Card, type MatchSnapshot } from '@wild-table/protocol';
import type { RoomGameStore } from '../../room/game';
import type { TableRoundStore } from '.';
import { deckCardSpot, handCardSpot, pileCardSpot, seatCardSpot } from './layout';

// Your hand sorted the way people sort theirs: by colour, then by number and symbol, wilds last.
const colourRank = { red: 0, yellow: 1, green: 2, blue: 3 } as const;
const kindRank = { skip: 10, reverse: 11, draw2: 12 } as const;

const cardRank = (card: Card): number => {
  if (isWild(card)) return card.kind === 'wild' ? 400 : 401;

  return colourRank[card.colour] * 100 + (card.kind === 'number' ? card.value : kindRank[card.kind]);
};

const sorted = (cards: readonly Card[]): Card[] => [...cards].sort((a, b) => cardRank(a) - cardRank(b));

// Every frame: where each card is headed. Your hand fans along the bottom of the view (the card
// you hold follows the pointer instead), the pile in the middle, the others' hands at their places.
export const placeCards = (round: TableRoundStore, game: RoomGameStore): void => {
  const { cards, hand, frame } = round;
  const { match } = game;
  const mine = cards.hand;

  mine.forEach((id, index) => {
    if (hand.heldId === id) return;

    const raise = hand.selectedId === id ? 'selected' : hand.hoveredId === id && !hand.isDragging ? 'hovered' : 'none';

    cards.body(id)?.to(handCardSpot(frame, index, mine.length, raise));
  });

  cards.pile.forEach((key, index) => {
    const body = cards.body(key);

    body?.to(body.arcOver(pileCardSpot(key, index)));
  });

  match.seats.forEach((seat) => {
    const keys = cards.seat(seat.id);
    const hovered = match.hovers.get(seat.id);

    keys.forEach((key, index) => cards.body(key)?.to(seatCardSpot(seat.angle, index, keys.length, hovered === index, cards.faceOf(key) !== null)));
  });
};

// Your cards as the table has them now: in a round, your hand; after it, what was left in it.
const yourCards = (game: RoomGameStore): readonly Card[] => {
  if (game.state === 'round') return game.hand.cards;

  return game.match.snapshot?.result?.hands[game.match.meId] ?? [];
};

const settleHand = (round: TableRoundStore, game: RoomGameStore): void => {
  const { cards } = round;
  const mine = sorted(yourCards(game));
  const ids = mine.map((card) => card.id);

  mine.filter((card) => !cards.has(card.id)).forEach((card) => cards.add(card.id, card, { kind: 'hand' }, deckCardSpot(round.deckSize)));
  mine.filter((card) => cards.placeOf(card.id)?.kind === 'pile' && !round.isPending(card.id)).forEach((card) => cards.move(card.id, { kind: 'hand' }));
  cards.hand.filter((id) => !ids.includes(id) && !round.isPending(id)).forEach((id) => cards.remove(id));
  cards.orderHand(ids);

  // A card you'd picked that can't be played any more drops back.
  if (round.hand.selectedId && !game.hand.canPlay(round.hand.selectedId)) round.hand.deselect();
};

// The others' hands: as many backs as they hold, or, once the round is over, their cards face up.
const settleSeats = (round: TableRoundStore, game: RoomGameStore, match: MatchSnapshot): void => {
  const { cards } = round;
  const shown = match.result?.hands ?? null;
  const others = match.seats.filter((seat) => seat.id !== game.match.meId);

  cards.seatIds.filter((seat) => !others.some((other) => other.id === seat)).forEach((seat) => cards.seat(seat).forEach((key) => cards.remove(key)));

  others.forEach((seat) => {
    const faces = shown?.[seat.id] ?? null;
    const count = faces ? faces.length : seat.cards;

    while (cards.seat(seat.id).length < count) cards.addBack(seat.id, deckCardSpot(round.deckSize));

    cards.seat(seat.id).slice(count).forEach((key) => cards.remove(key));
    cards.seat(seat.id).forEach((key, index) => cards.reveal(key, faces?.[index] ?? null));
  });
};

// The top of the pile, if the events didn't put it there (you joined mid-round, say).
const settlePile = (round: TableRoundStore, top: Card): void => {
  const { cards } = round;

  if (cards.pile.at(-1) === top.id) return;

  if (cards.has(top.id)) cards.move(top.id, { kind: 'pile' });
  else cards.add(top.id, top, { kind: 'pile' }, { ...pileCardSpot(top.id, cards.pile.length), y: 0.5 });
};

// Once the events have played: the cards settle on what the table says is true now, so whatever
// the events missed (a reload, a swap of hands, a reshuffle) comes right.
export const settleCards = (round: TableRoundStore, game: RoomGameStore): void => {
  const match = game.match.snapshot;

  if (game.state === 'lobby' || !match) {
    round.cards.clear();
    round.pending.clear();

    return;
  }

  const live = match.round;

  if (live) {
    // A Wild waiting for its colour has none yet.
    round.colour = isWild(live.top) && live.step === 'pickColour' ? null : live.colour;
    round.direction = live.direction;
    round.deckSize = live.deckSize;
    settlePile(round, live.top);
  }

  settleHand(round, game);
  settleSeats(round, game, match);
};
