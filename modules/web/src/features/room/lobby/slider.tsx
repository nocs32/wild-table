import { Slider } from '@ark-ui/react/slider';
import type { ReactElement } from 'react';
import {
  RoomLobbyField,
  RoomLobbyFieldHead,
  RoomLobbyHint,
  RoomLobbyLabel,
  RoomLobbySliderControl,
  RoomLobbySliderRange,
  RoomLobbySliderRoot,
  RoomLobbySliderThumb,
  RoomLobbySliderTrack,
  RoomLobbyValue,
} from './styled-components';

interface RoomLobbySettingsSliderProps {
  label: string;
  valueText: string;
  // What the setting does, right under it.
  hint: string;
  value: number;
  range: { min: number; max: number; step: number };
  disabled: boolean;
  // While dragging; `onCommit` when you let go.
  onPreview: (values: number[]) => void;
  onCommit: () => void;
}

export function RoomLobbySettingsSlider({ label, valueText, hint, value, range, disabled, onPreview, onCommit }: RoomLobbySettingsSliderProps): ReactElement {
  return (
    <RoomLobbyField>
      <RoomLobbySliderRoot
        value={[value]}
        min={range.min}
        max={range.max}
        step={range.step}
        disabled={disabled}
        onValueChange={(details) => onPreview(details.value)}
        onValueChangeEnd={onCommit}
      >
        <RoomLobbyFieldHead>
          <Slider.Label asChild>
            <RoomLobbyLabel>{label}</RoomLobbyLabel>
          </Slider.Label>
          <RoomLobbyValue>{valueText}</RoomLobbyValue>
        </RoomLobbyFieldHead>
        <RoomLobbySliderControl>
          <RoomLobbySliderTrack>
            <RoomLobbySliderRange />
          </RoomLobbySliderTrack>
          <RoomLobbySliderThumb index={0}>
            <Slider.HiddenInput />
          </RoomLobbySliderThumb>
        </RoomLobbySliderControl>
      </RoomLobbySliderRoot>
      <RoomLobbyHint>{hint}</RoomLobbyHint>
    </RoomLobbyField>
  );
}
