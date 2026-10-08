import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundFuseRoot } from './styled-components';
import { useRoomRoundFuse } from './use-fuse';

// Your fuse (spec D11): in your turn's last 8 seconds it burns along your edge of the screen.
export const RoomRoundFuse = observer(function RoomRoundFuse(): ReactElement {
  const { turn } = useRootStore().room.game;
  const ref = useRoomRoundFuse(turn);

  return <RoomRoundFuseRoot ref={ref} role="timer" aria-label={turn.secondsLabel} />;
});
