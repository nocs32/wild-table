import { Slider } from '@ark-ui/react/slider';
import type { ReactElement } from 'react';
import {
  SettingHead,
  SettingHint,
  SettingLabel,
  SettingSliderControl,
  SettingSliderRange,
  SettingSliderRoot,
  SettingSliderThumb,
  SettingSliderTrack,
  SettingValue,
} from './styled-components';

interface SettingSliderProps {
  label: string;
  valueText: string;
  // What the setting does, right under it.
  hint?: string;
  value: number;
  range: { min: number; max: number; step: number };
  disabled?: boolean;
  // On the room's dark panels, or on a printed card.
  surface: 'room' | 'print';
  // While dragging; `onCommit` when you let go.
  onPreview: (values: number[]) => void;
  onCommit: () => void;
}

// A numeric setting: a groove in the four card colours with a poker chip for a handle.
export function SettingSlider({ label, valueText, hint, value, range, disabled = false, surface, onPreview, onCommit }: SettingSliderProps): ReactElement {
  return (
    <SettingSliderRoot value={[value]} min={range.min} max={range.max} step={range.step} disabled={disabled} onValueChange={(details) => onPreview(details.value)} onValueChangeEnd={onCommit}>
      <SettingHead>
        <Slider.Label asChild>
          <SettingLabel>{label}</SettingLabel>
        </Slider.Label>
        <SettingValue surface={surface}>{valueText}</SettingValue>
      </SettingHead>
      <SettingSliderControl>
        <SettingSliderTrack surface={surface}>
          <SettingSliderRange />
        </SettingSliderTrack>
        <SettingSliderThumb index={0}>
          <Slider.HiddenInput />
        </SettingSliderThumb>
      </SettingSliderControl>
      {hint && <SettingHint surface={surface}>{hint}</SettingHint>}
    </SettingSliderRoot>
  );
}
