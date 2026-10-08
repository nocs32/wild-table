import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { useCardGlowTexture, useCardTexture } from '../use-textures';
import { RoomTableRoundBell } from './bell';
import { RoomTableRoundCard } from './card';
import { RoomTableRoundDeck } from './deck';
import { RoomTableRoundPile } from './pile';
import { RoomTableRoundSeat } from './seat';
import { useRoomTableRoundFrames } from './use-frames';

// A round on the 3D table (spec §4.3, §8): the deck and the pile in the middle with the colour in
// play and the direction ring, every card in play, your hand along the bottom of the view, each
// player's place card round the rail, and the Last card! bell.
export const RoomTableRound = observer(function RoomTableRound(): ReactElement {
  const { art, room, table } = useRootStore();
  const back = useCardTexture(art.backCanvas());
  const halo = useCardGlowTexture();
  const register = useRoomTableRoundFrames(table.round, room.game);

  return (
    <group>
      <RoomTableRoundPile />
      <RoomTableRoundDeck back={back} />
      {table.round.cards.views.map((view) => (
        <RoomTableRoundCard key={view.key} view={view} back={back} halo={halo} register={register} />
      ))}
      {room.game.isPlaying && <RoomTableRoundBell />}
      {room.game.match.seats.map((seat) => (
        <RoomTableRoundSeat key={seat.id} seat={seat} />
      ))}
    </group>
  );
});
