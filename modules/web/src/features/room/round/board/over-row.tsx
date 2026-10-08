import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { ResultRowView } from '../../../../stores/room/game/result';
import { Avatar } from '../../../../ui';
import { RoomRoundBoardName, RoomRoundBoardOverRowHand, RoomRoundBoardOverRowRoot, RoomRoundBoardOverRowText, RoomRoundBoardScore } from './styled-components';

interface RoomRoundBoardOverRowProps {
  row: ResultRowView;
}

// One seat in the round's scores: the cards they were left holding, face up, and their total.
export const RoomRoundBoardOverRow = observer(function RoomRoundBoardOverRow({ row }: RoomRoundBoardOverRowProps): ReactElement {
  const { seat } = row;

  return (
    <RoomRoundBoardOverRowRoot winner={row.isWinner}>
      <Avatar initial={seat.initial} color={seat.color} size="md" bot={seat.isBot} />
      <RoomRoundBoardOverRowText>
        <RoomRoundBoardName>{seat.name}</RoomRoundBoardName>
        {!row.isWinner && (
          <RoomRoundBoardOverRowHand>
            {row.cards.map((card) => (card.url ? <img key={card.key} src={card.url} alt={card.label} title={card.label} /> : null))}
            {row.handLabel}
          </RoomRoundBoardOverRowHand>
        )}
      </RoomRoundBoardOverRowText>
      <RoomRoundBoardScore>{seat.scoreLabel}</RoomRoundBoardScore>
    </RoomRoundBoardOverRowRoot>
  );
});
