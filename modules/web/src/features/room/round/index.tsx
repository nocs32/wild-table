import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundBoard } from './board';
import { RoomRoundCaptions } from './captions';
import { RoomRoundRoot } from './styled-components';
import { RoomRoundTurn } from './turn';

// The match over the 3D table (spec §4.3, §4.4): during a round, whose turn it is and the buttons
// for yours, and the captions; between rounds, the scores; at the end, the podium. Your fuse burns
// on the table itself.
export const RoomRound = observer(function RoomRound(): ReactElement {
  const { room, ui } = useRootStore();
  const { game } = room;

  return (
    <RoomRoundRoot compact={ui.layout.isCompact}>
      {game.isPlaying && <RoomRoundTurn />}
      <RoomRoundCaptions />
      {!game.isPlaying && <RoomRoundBoard />}
    </RoomRoundRoot>
  );
});
