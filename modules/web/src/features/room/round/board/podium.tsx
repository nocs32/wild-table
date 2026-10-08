import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ResetIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { Avatar, Button, GameCard } from '../../../../ui';
import {
  RoomRoundBoardBody,
  RoomRoundBoardFoot,
  RoomRoundBoardName,
  RoomRoundBoardNote,
  RoomRoundBoardPodiumBlock,
  RoomRoundBoardPodiumStep,
  RoomRoundBoardPodiumSteps,
  RoomRoundBoardScore,
} from './styled-components';

// The end of the match (spec §4.4): the top three on the podium with their points, then Play again,
// which keeps the table and the people and starts the scores from 0.
export const RoomRoundBoardPodium = observer(function RoomRoundBoardPodium(): ReactElement {
  const { locale, room } = useRootStore();
  const { result } = room.game;

  return (
    <GameCard suit="yellow" title={result.championTitle} subtitle={locale.t('round.podium.title')}>
      <RoomRoundBoardBody>
        <RoomRoundBoardPodiumSteps>
          {result.podium.map(({ seat, place, placeLabel }) => (
            <RoomRoundBoardPodiumStep key={seat.id}>
              <Avatar initial={seat.initial} color={seat.color} size="lg" bot={seat.isBot} />
              <RoomRoundBoardName>{seat.name}</RoomRoundBoardName>
              <RoomRoundBoardScore>{seat.scoreLabel}</RoomRoundBoardScore>
              <RoomRoundBoardPodiumBlock place={place as 1 | 2 | 3}>{placeLabel}</RoomRoundBoardPodiumBlock>
            </RoomRoundBoardPodiumStep>
          ))}
        </RoomRoundBoardPodiumSteps>
        <RoomRoundBoardFoot>
          <Button type="button" tone="primary" onClick={result.playAgain}>
            <ResetIcon />
            {locale.t('round.podium.playAgain')}
          </Button>
        </RoomRoundBoardFoot>
        <RoomRoundBoardNote>{locale.t('round.podium.playAgainHint')}</RoomRoundBoardNote>
      </RoomRoundBoardBody>
    </GameCard>
  );
});
