import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { TurnActionView } from '../../../stores/room/game/turn';
import { Button, suitIcons } from '../../../ui';
import { RoomRoundTurnColour } from './styled-components';

interface RoomRoundTurnActionProps {
  action: TurnActionView;
}

// One of the turn's buttons: an arcade button, or for a colour, a button in that colour with its
// symbol (D22).
export const RoomRoundTurnAction = observer(function RoomRoundTurnAction({ action }: RoomRoundTurnActionProps): ReactElement {
  if (action.tone === 'primary' || action.tone === 'secondary') {
    return (
      <Button type="button" tone={action.tone} onClick={action.run}>
        {action.label}
      </Button>
    );
  }

  const Symbol = suitIcons[action.tone];

  return (
    <RoomRoundTurnColour type="button" suit={action.tone} onClick={action.run}>
      <Symbol />
      {action.label}
    </RoomRoundTurnColour>
  );
});
