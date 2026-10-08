import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTableFiguresItem } from './item';

// The players as stick figures (spec §8): in the lobby, everyone who's joined hangs about the room;
// once the cards are dealt, the others stand at their seats round the table. Each keeps its figure
// throughout, walking from one to the other.
export const RoomTableFigures = observer(function RoomTableFigures(): ReactElement {
  const { moods } = useRootStore().room.game;

  return (
    <>
      {moods.figures.map((view) => (
        <RoomTableFiguresItem key={view.seat} view={view} />
      ))}
    </>
  );
});
