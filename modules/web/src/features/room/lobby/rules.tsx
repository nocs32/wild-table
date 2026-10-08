import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { GameCard } from '../../../ui';
import { RoomLobbyRulesItem } from './rules-item';
import { RoomLobbyRulesList } from './styled-components';

// The house rules (spec §5.7): switches, all off by default. Each says what it does, and its (?)
// opens its page in the rule book.
export const RoomLobbyRules = observer(function RoomLobbyRules(): ReactElement {
  const { locale, room } = useRootStore();
  const { settings } = room.game;

  return (
    <GameCard suit="green" title={locale.t('lobby.houseRules')} subtitle={settings.houseRulesSummary}>
      <RoomLobbyRulesList>
        {settings.houseRuleViews.map((view) => (
          <RoomLobbyRulesItem key={view.rule} view={view} />
        ))}
      </RoomLobbyRulesList>
    </GameCard>
  );
});
