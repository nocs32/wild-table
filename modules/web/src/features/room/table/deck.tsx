import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableDeckCard } from './deck-card';
import { useRoomTableDeckFrames } from './use-deck';
import { useCardTexture } from './use-textures';

// The deck in the middle of the table: something to play with while people gather (spec §4.2,
// §8.2). Every card shares the back; each shows its own face once turned over.
export const RoomTableDeck = observer(function RoomTableDeck(): ReactElement {
  const { art, table } = useRootStore();
  const back = useCardTexture(art.backCanvas());
  const register = useRoomTableDeckFrames(table.deck);

  return (
    <group>
      {table.deck.faces.map((face, id) => (
        <RoomTableDeckCard key={id} id={id} face={face} back={back} register={register} />
      ))}
    </group>
  );
});
