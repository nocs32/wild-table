import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { HelpIcon } from '../../../assets';
import type { HouseRuleView } from '../../../stores/room/game/settings';
import { useRootStore } from '../../../stores/use-root-store';
import { IconButton, SettingSwitch } from '../../../ui';
import { RoomLobbyRulesHelp, RoomLobbyRulesItemRoot } from './styled-components';

interface RoomLobbyRulesItemProps {
  view: HouseRuleView;
}

// One house rule: what it does, its switch, and a (?) for the whole story in the rule book.
export const RoomLobbyRulesItem = observer(function RoomLobbyRulesItem({ view }: RoomLobbyRulesItemProps): ReactElement {
  const { locale, room, ruleBook } = useRootStore();
  const { settings } = room.game;
  const helpLabel = locale.t('lobby.ruleHelp', { rule: view.name });

  return (
    <RoomLobbyRulesItemRoot on={view.on}>
      <SettingSwitch label={view.name} hint={view.hint} checked={view.on} disabled={!settings.isEditable} surface="print" onChange={(on) => settings.setHouseRule(view.rule, on)} />
      <RoomLobbyRulesHelp>
        <IconButton surface="print" type="button" aria-label={helpLabel} title={helpLabel} onClick={() => ruleBook.openHouseRule(view.rule)}>
          <HelpIcon />
        </IconButton>
      </RoomLobbyRulesHelp>
    </RoomLobbyRulesItemRoot>
  );
});
