import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableTentsItem } from './tent';

// The house rules switched on stand on the table as little tent cards (spec §5.7, §8.1), so
// everyone can see the rules in play.
export const RoomTableTents = observer(function RoomTableTents(): ReactElement {
  const { settings } = useRootStore().room.game;

  return (
    <group>
      {settings.activeHouseRules.map((view, index) => (
        <RoomTableTentsItem key={view.rule} view={view} index={index} count={settings.activeHouseRules.length} />
      ))}
    </group>
  );
});
