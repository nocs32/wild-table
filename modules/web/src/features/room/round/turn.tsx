import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundTurnAction } from './turn-action';
import { RoomRoundTurnActions, RoomRoundTurnHead, RoomRoundTurnHint, RoomRoundTurnRoot, RoomRoundTurnTime, RoomRoundTurnTitle } from './styled-components';

// Whose turn it is and what it's waiting for (spec D7), with the buttons when it's yours: play or
// keep a drawn card, pick a colour, take the cards or challenge, pick a hand to swap with. On a
// phone, someone else's turn is only its title: there's no room to spare over the figures.
export const RoomRoundTurn = observer(function RoomRoundTurn(): ReactElement | null {
  const { room, ui } = useRootStore();
  const { turn } = room.game;
  const prompt = turn.prompt;

  if (!prompt) return null;

  return (
    <RoomRoundTurnRoot mine={prompt.isMine} aria-live="polite">
      <RoomRoundTurnHead>
        <RoomRoundTurnTitle>{prompt.title}</RoomRoundTurnTitle>
        <RoomRoundTurnTime urgent={turn.isBurning}>{turn.secondsLabel}</RoomRoundTurnTime>
      </RoomRoundTurnHead>
      {!(prompt.isBrief && ui.layout.isCompact) && <RoomRoundTurnHint>{prompt.hint}</RoomRoundTurnHint>}
      {prompt.actions.length > 0 && (
        <RoomRoundTurnActions>
          {prompt.actions.map((action) => (
            <RoomRoundTurnAction key={action.key} action={action} />
          ))}
        </RoomRoundTurnActions>
      )}
    </RoomRoundTurnRoot>
  );
});
