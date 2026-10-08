import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { useCardGlowTexture, useCardTexture } from '../use-textures';
import { RoomTableRoundBell } from './bell';
import { RoomTableRoundCard } from './card';
import { RoomTableRoundDeck } from './deck';
import { RoomTableRoundFuse } from './fuse';
import { RoomTableRoundOrbs } from './orbs';
import { RoomTableRoundPile } from './pile';
import { RoomTableRoundSeat } from './seat';
import { useRoomTableRoundFrames } from './use-frames';

// A round on the 3D table (spec §4.3, §8): the deck and the pile in the middle with the colour in
// play and the direction ring, every card in play, your hand along the bottom of the view, each
// player's place card round the rail, the Last card! bell, the colour orbs after your Wild, and your
// fuse burning along the rail in your turn's last seconds.
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
      {table.round.isPickingColour && <RoomTableRoundOrbs />}
      {room.game.turn.isBurning && <RoomTableRoundFuse />}
      {room.game.match.seats.map((seat) => (
        <RoomTableRoundSeat key={seat.id} seat={seat} />
      ))}
    </group>
  );
});
