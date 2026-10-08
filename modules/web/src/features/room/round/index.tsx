import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundAnnouncement } from './announcement';
import { RoomRoundBoard } from './board';
import { RoomRoundCaptions } from './captions';
import { RoomRoundEdge, RoomRoundRoot } from './styled-components';
import { RoomRoundTurn } from './turn';
import { useRoomRoundInsets } from './use-insets';

// The match over the 3D table (spec §4.3, §4.4): during a round, whose turn it is and the buttons
// for yours, and the captions; between rounds, the scores; at the end, the podium. The scores wait
// for the winning card to land, so its slow motion can be seen. Your fuse burns
// on the table itself. When it's your turn, "Your turn!" pops up and the edges of the view glow.
export const RoomRound = observer(function RoomRound(): ReactElement {
  const { room, table, ui } = useRootStore();
  const { game } = room;
  const insets = useRoomRoundInsets(table, ui.layout.isCompact);

  return (
    <RoomRoundRoot ref={insets} compact={ui.layout.isCompact}>
      {game.isPlaying && game.turn.isMine && <RoomRoundEdge />}
      {game.isPlaying && game.turn.isMine && game.turn.announced > 0 && <RoomRoundAnnouncement key={game.turn.announced} />}
      {game.isPlaying && <RoomRoundTurn />}
      <RoomRoundCaptions />
      {!game.isPlaying && !table.round.isReplaying && <RoomRoundBoard />}
    </RoomRoundRoot>
  );
});
