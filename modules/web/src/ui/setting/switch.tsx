import { Switch } from '@ark-ui/react/switch';
import type { ReactElement } from 'react';
import { SettingHint, SettingSwitchControl, SettingSwitchLabel, SettingSwitchRoot, SettingSwitchText, SettingSwitchThumb } from './styled-components';

interface SettingSwitchProps {
  label: string;
  // What it does, right under it.
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  surface: 'room' | 'print';
  onChange: (checked: boolean) => void;
}

// An on/off setting: the label and hint, and a chunky toggle that turns felt green.
export function SettingSwitch({ label, hint, checked, disabled = false, surface, onChange }: SettingSwitchProps): ReactElement {
  return (
    <SettingSwitchRoot checked={checked} disabled={disabled} onCheckedChange={(details) => onChange(details.checked)}>
      <SettingSwitchText>
        <SettingSwitchLabel>{label}</SettingSwitchLabel>
        {hint && <SettingHint surface={surface}>{hint}</SettingHint>}
      </SettingSwitchText>
      <SettingSwitchControl surface={surface}>
        <SettingSwitchThumb />
      </SettingSwitchControl>
      <Switch.HiddenInput />
    </SettingSwitchRoot>
  );
}
