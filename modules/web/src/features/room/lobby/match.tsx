import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { GameCard, SettingSlider } from '../../../ui';

// How a match runs (spec §5.8): the points to win, the time per turn, and the cards dealt.
export const RoomLobbyMatch = observer(function RoomLobbyMatch(): ReactElement {
  const { locale, room } = useRootStore();
  const { settings } = room.game;

  return (
    <GameCard suit="red" title={locale.t('lobby.match')} subtitle={locale.t('lobby.subtitle')}>
      {settings.sliders.map((slider) => (
        <SettingSlider
          key={slider.key}
          label={slider.label}
          valueText={slider.valueText}
          hint={slider.hint}
          value={slider.value}
          range={slider.range}
          disabled={!settings.isEditable}
          surface="print"
          onPreview={slider.preview}
          onCommit={settings.commitSliders}
        />
      ))}
    </GameCard>
  );
});
