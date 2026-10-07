import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomLobbySettingsInvite } from './invite';
import { RoomLobbySettingsSlider } from './slider';
import { RoomLobbyCard, RoomLobbyCardTitle, RoomLobbySettingsHead, RoomLobbySettingsSubtitle } from './styled-components';

// The shared settings (spec §5.8): anyone may change them, and every change shows in the chat.
// The house-rule switches come with the game.
export const RoomLobbySettings = observer(function RoomLobbySettings(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { settings } = room.game;

  return (
    <RoomLobbyCard area="settings">
      <RoomLobbySettingsHead>
        <RoomLobbyCardTitle>{t('lobby.title')}</RoomLobbyCardTitle>
        <RoomLobbySettingsSubtitle>{t('lobby.subtitle')}</RoomLobbySettingsSubtitle>
      </RoomLobbySettingsHead>
      <RoomLobbySettingsSlider
        label={t('lobby.targetScore')}
        valueText={settings.targetScoreLabel}
        hint={settings.targetScoreHint}
        value={settings.targetScore}
        range={settings.limits.targetScore}
        disabled={!settings.isEditable}
        onPreview={settings.previewTargetScore}
        onCommit={settings.commitSliders}
      />
      <RoomLobbySettingsSlider
        label={t('lobby.turnTime')}
        valueText={settings.turnTimeLabel}
        hint={settings.turnTimeHint}
        value={settings.turnSeconds}
        range={settings.limits.turnSeconds}
        disabled={!settings.isEditable}
        onPreview={settings.previewTurnSeconds}
        onCommit={settings.commitSliders}
      />
      <RoomLobbySettingsInvite />
    </RoomLobbyCard>
  );
});
