import { Html } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { MatchSeatView } from '../../../../stores/room/game/match';
import { useRootStore } from '../../../../stores/use-root-store';
import { Avatar } from '../../../../ui';
import { RoomTableRoundSeatEmotes } from './seat-emotes';
import { useRoomTableRoundSeat } from './use-seat';
import {
  RoomTableRoundSeatBubble,
  RoomTableRoundSeatChip,
  RoomTableRoundSeatName,
  RoomTableRoundSeatRoot,
  RoomTableRoundSeatStats,
  RoomTableRoundSeatTag,
  RoomTableRoundSeatText,
} from './styled-components';

interface RoomTableRoundSeatProps {
  seat: MatchSeatView;
}

// A player's place at the table (spec §8): their chip, name, cards and score, glowing on their
// turn, with a 🤖 while a bot plays the seat, "Last card!" while they can be caught, and their emotes
// in a speech bubble. Your own chip opens your emotes; anyone else's mutes theirs (or, on your 7,
// swaps hands with them).
export const RoomTableRoundSeat = observer(function RoomTableRoundSeat({ seat }: RoomTableRoundSeatProps): ReactElement {
  const { locale, room, table } = useRootStore();
  const { emotes } = room.game;
  const bubble = emotes.bubbleOf(seat.id);
  const hint = room.game.seatHint(seat.id, seat.name);
  const spot = useRoomTableRoundSeat(table.round, seat.angle, seat.isMe);

  return (
    <group ref={spot}>
      <Html center zIndexRange={[20, 10]}>
        <RoomTableRoundSeatRoot turn={seat.isTurn}>
          {seat.isMe ? (
            <RoomTableRoundSeatEmotes seat={seat} emotes={emotes} title={locale.t('round.emotes.open')} hint={locale.t('round.emotes.hint')} />
          ) : (
            <RoomTableRoundSeatChip type="button" aria-label={hint} title={hint} onClick={() => room.game.pickSeat(seat.id)}>
              <Avatar initial={seat.initial} color={seat.color} size="md" bot={seat.isBot} />
            </RoomTableRoundSeatChip>
          )}
          <RoomTableRoundSeatText>
            <RoomTableRoundSeatName>{seat.isMe ? locale.t('round.seat.you') : seat.name}</RoomTableRoundSeatName>
            <RoomTableRoundSeatStats>
              {seat.cardsLabel} · {seat.scoreLabel}
            </RoomTableRoundSeatStats>
          </RoomTableRoundSeatText>
          {seat.isRacing && <RoomTableRoundSeatTag>{locale.t('round.bell.label')}</RoomTableRoundSeatTag>}
          {bubble && <RoomTableRoundSeatBubble>{bubble}</RoomTableRoundSeatBubble>}
        </RoomTableRoundSeatRoot>
      </Html>
    </group>
  );
});
