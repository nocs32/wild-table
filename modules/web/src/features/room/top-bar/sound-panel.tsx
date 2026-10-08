import { Popover } from '@ark-ui/react/popover';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { PanelContent, SettingSlider, SettingSwitch } from '../../../ui';
import { RoomTopBarSoundPanelTitle } from './styled-components';

// Letting go of the volume plays the chime at the new level. Lighter graphics live here too.
export const RoomTopBarSoundPanel = observer(function RoomTopBarSoundPanel(): ReactElement {
  const { locale, sound, graphics } = useRootStore();
  const { t } = locale;

  return (
    <PanelContent>
      <Popover.Title asChild>
        <RoomTopBarSoundPanelTitle>{t('sound.title')}</RoomTopBarSoundPanelTitle>
      </Popover.Title>
      <SettingSwitch label={t('sound.game')} hint={t('sound.hint')} checked={sound.isOn} surface="room" onChange={sound.setOn} />
      <SettingSlider
        label={t('sound.volume')}
        valueText={sound.volumeText}
        value={sound.volume}
        range={{ min: 0, max: 100, step: 5 }}
        disabled={!sound.isOn}
        surface="room"
        onPreview={sound.previewVolume}
        onCommit={sound.commitVolume}
      />
      <SettingSwitch label={t('graphics.light')} hint={t('graphics.hint')} checked={graphics.isLight} surface="room" onChange={graphics.setLight} />
    </PanelContent>
  );
});
