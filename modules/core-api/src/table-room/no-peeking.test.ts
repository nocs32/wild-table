import { checkPlay } from '@wild-table/engine';
import type { TableIntents, TableIntentType, TableViewEvent } from '@wild-table/protocol';
import { expect, test } from 'vitest';
import { all, latest, sitDown, until, useTestRoom, type Seat } from './test-room.js';

// A round played through a real room (port 2593; the lobby test uses 2592), and the check from
// spec §11: a player's browser records every message, and no card from another hand may appear in
// it until it's played (D13).
const room = useTestRoom(2593);

const send = <K extends TableIntentType>(seat: Seat, type: K, message: TableIntents[K]): boolean => {
  seat.room.send(type, message);

  return true;
};

// One step of a simple player: hit the bell for its own last card, and on its turn play the first
// card that fits (or draw), keep a drawn card, pick red, take the cards, swap with anyone.
const act = (seat: Seat): boolean => {
  const view = latest(seat, 'view');
  const hand = latest(seat, 'hand');
  const me = seat.room.sessionId;
  const round = view?.game.match?.round;

  if (!view || !round || !hand || view.game.phase !== 'round') return false;

  if (round.race === me) return send(seat, 'bell', {});

  if (round.turn !== me) return false;

  switch (round.step) {
    case 'play': {
      const card = hand.cards.find((one) => checkPlay(one, { card: round.top, colour: round.colour }, hand.cards, view.game.settings.houseRules).fits);

      return card ? send(seat, 'play', { cardId: card.id, strength: 0.5 }) : send(seat, 'draw', {});
    }

    case 'drawn':
      return send(seat, 'keep', {});
    case 'pickColour':
      return send(seat, 'pickColour', { colour: 'red' });
    case 'answer':
      return send(seat, 'take', {});
    case 'swap':
      return send(seat, 'swap', { target: view.game.match?.seats.find((other) => other.id !== me)?.id ?? me });
  }
};

// Plays whenever something new arrives, at a person's pace, until stopped.
const autoPlay = (seat: Seat): (() => void) => {
  let seen = 0;
  let actedAt = 0;

  const timer = setInterval(() => {
    const now = Date.now();
    const isNew = seat.log.length !== seen;

    if (now - actedAt < 200 || (!isNew && now - actedAt < 600)) return;

    seen = seat.log.length;

    if (act(seat)) actedAt = now;
  }, 25);

  return () => clearInterval(timer);
};

const cardIds = (value: unknown): string[] =>
  [...JSON.stringify(value).matchAll(/"id":"((?:red|yellow|green|blue)-[a-z0-9]+\.\d+|wild4?\.\d+)"/gu)].map((match) => match[1] ?? '');

// Every card id `viewer` was sent, outside its own hand and the round's end (where every hand turns
// face up), that belonged to `other` and was never played.
const leakedTo = (viewer: Seat, other: Seat): string[] => {
  const played = new Set(all(viewer, 'play').flatMap(({ events }) => events.flatMap((event) => (event.type === 'played' ? [event.card.id] : event.type === 'dealt' ? [event.first.id] : []))));
  const theirs = new Set(all(other, 'hand').flatMap((hand) => hand.cards.map((card) => card.id)));
  const sent = viewer.log.filter(({ type, payload }) => type !== 'hand' && !(type === 'view' && (payload as TableViewEvent).game.match?.result)).flatMap(({ payload }) => cardIds(payload));

  return [...new Set(sent)].filter((id) => theirs.has(id) && !played.has(id));
};

test('two people play a round through the room, and neither is ever sent the other’s cards', async () => {
  const [ana, bo] = (await sitDown(room, 2)) as [Seat, Seat];

  ana.room.send('updateSettings', { handSize: 5 });
  await until(() => latest(bo, 'view')?.game.settings.handSize === 5);
  bo.room.send('start', {});
  await until(() => latest(ana, 'view')?.game.phase === 'round');

  expect(latest(ana, 'hand')?.cards.length).toBeGreaterThanOrEqual(5);

  const stops = [autoPlay(ana), autoPlay(bo)];

  await until(() => ['roundOver', 'podium'].includes(latest(ana, 'view')?.game.phase ?? ''), 60_000);
  stops.forEach((stop) => stop());

  expect(latest(bo, 'view')?.game.match?.result?.winner).toMatch(/.+/u);
  expect(all(bo, 'hand').length).toBeGreaterThan(1);
  expect(leakedTo(ana, bo)).toEqual([]);
  expect(leakedTo(bo, ana)).toEqual([]);
}, 90_000);
