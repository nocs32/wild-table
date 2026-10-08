import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRoundBoardOver } from './over';
import { RoomRoundBoardPodium } from './podium';
import { RoomRoundBoardRoot } from './styled-components';

// Between rounds, the scores; at the end of the match, the podium (spec §4.3, §4.4).
export const RoomRoundBoard = observer(function RoomRoundBoard(): ReactElement {
  const { game } = useRootStore().room;

  return <RoomRoundBoardRoot>{game.state === 'podium' ? <RoomRoundBoardPodium /> : <RoomRoundBoardOver />}</RoomRoundBoardRoot>;
});
