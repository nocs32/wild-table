import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { PlayIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { Button, GameCard } from '../../../../ui';
import { RoomRoundBoardOverRow } from './over-row';
import { RoomRoundBoardBody, RoomRoundBoardFoot, RoomRoundBoardList, RoomRoundBoardNote, RoomRoundBoardPoints } from './styled-components';

// The round's end (spec §4.3): who won and what they scored, every hand left face up with what it
// was worth, everyone's total, and the next round in 10 seconds (or now).
export const RoomRoundBoardOver = observer(function RoomRoundBoardOver(): ReactElement {
  const { locale, room } = useRootStore();
  const { result } = room.game;

  return (
    <GameCard suit="green" title={result.title} subtitle={locale.t('round.over.title')}>
      <RoomRoundBoardBody>
        <RoomRoundBoardPoints>{result.pointsLabel}</RoomRoundBoardPoints>
        <RoomRoundBoardList>
          {result.rows.map((row) => (
            <RoomRoundBoardOverRow key={row.seat.id} row={row} />
          ))}
        </RoomRoundBoardList>
        <RoomRoundBoardNote>{result.targetLabel}</RoomRoundBoardNote>
        <RoomRoundBoardFoot>
          <RoomRoundBoardNote role="timer">{result.nextLabel}</RoomRoundBoardNote>
          <Button type="button" tone="primary" size="sm" onClick={result.next}>
            <PlayIcon />
            {locale.t('round.over.nextNow')}
          </Button>
        </RoomRoundBoardFoot>
      </RoomRoundBoardBody>
    </GameCard>
  );
});
