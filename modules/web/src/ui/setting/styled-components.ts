import { Slider } from '@ark-ui/react/slider';
import { Switch } from '@ark-ui/react/switch';
import { styled } from 'styled-system/jsx';

// A setting's label, value and hint: the same on the room's panels and on printed cards.
export const SettingHead = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' },
});

export const SettingLabel = styled('label', {
  base: { fontFamily: 'display', fontSize: '14px', fontWeight: '700', '@media (max-height: 540px)': { fontSize: '15px' } },
});

export const SettingValue = styled('span', {
  base: { fontFamily: 'display', fontSize: '14px', fontWeight: '800', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  variants: {
    surface: {
      room: { color: 'accent.text' },
      print: { color: 'suit.redDeep' },
    },
  },
});

export const SettingHint = styled('span', {
  base: { fontSize: '12.5px', lineHeight: '1.4', '@media (max-height: 540px)': { fontSize: '13.5px' } },
  variants: {
    surface: {
      room: { color: 'fg.subtle' },
      print: { color: 'print.muted' },
    },
  },
});

export const SettingSliderRoot = styled(Slider.Root, {
  base: { display: 'grid', gap: '8px', '&[data-disabled]': { opacity: '0.5' } },
});

export const SettingSliderControl = styled(Slider.Control, {
  base: { position: 'relative', display: 'flex', alignItems: 'center', height: '24px' },
});

// A groove cut into the surface, filled with the four card colours.
export const SettingSliderTrack = styled(Slider.Track, {
  base: { flex: '1', height: '8px', borderRadius: 'full', overflow: 'hidden' },
  variants: {
    surface: {
      room: { bg: 'room.night', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 226, 170, 0.08)' },
      print: { bg: 'rgba(34, 23, 14, 0.12)', boxShadow: 'inset 0 1px 2px rgba(34, 23, 14, 0.25)' },
    },
  },
});

export const SettingSliderRange = styled(Slider.Range, {
  base: { height: '100%', bgImage: 'linear-gradient(90deg, {colors.suit.red}, {colors.suit.yellow} 36%, {colors.suit.green} 68%, {colors.suit.blue})' },
});

// The handle: a poker chip.
export const SettingSliderThumb = styled(Slider.Thumb, {
  base: {
    width: '24px',
    height: '24px',
    borderRadius: 'full',
    bg: 'print.card',
    bgImage: 'radial-gradient(circle, {colors.print.card} 0 42%, transparent 42%), repeating-conic-gradient({colors.print.ink} 0 18deg, {colors.print.card} 18deg 45deg)',
    border: '2px solid',
    borderColor: 'print.ink',
    boxShadow: '0 2px 0 {colors.print.ink}, 0 4px 8px rgba(0, 0, 0, 0.3)',
    cursor: 'grab',
    transition: 'transform 0.1s ease',
    _hover: { transform: 'scale(1.08)' },
    _active: { cursor: 'grabbing', transform: 'scale(1.12) rotate(30deg)' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});

export const SettingSwitchRoot = styled(Switch.Root, {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', cursor: 'pointer', '&[data-disabled]': { cursor: 'not-allowed', opacity: '0.55' } },
});

export const SettingSwitchText = styled('span', {
  base: { display: 'grid', gap: '2px', minWidth: '0' },
});

// Ark's own label part: the switch is already a <label>, and labels can't nest.
export const SettingSwitchLabel = styled(Switch.Label, {
  base: { fontFamily: 'display', fontSize: '14px', fontWeight: '700', '@media (max-height: 540px)': { fontSize: '15px' } },
});

// A chunky toggle: felt green when it's on.
export const SettingSwitchControl = styled(Switch.Control, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: '0',
    width: '46px',
    height: '26px',
    padding: '2px',
    borderRadius: 'full',
    border: '2px solid',
    transition: 'background-color 0.15s ease',
    '&[data-state=checked]': { bg: 'suit.green' },
    '&[data-focus-visible]': { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
  variants: {
    surface: {
      room: { bg: 'room.night', borderColor: 'border.strong' },
      print: { bg: 'print.shade', borderColor: 'print.ink' },
    },
  },
});

export const SettingSwitchThumb = styled(Switch.Thumb, {
  base: {
    width: '18px',
    height: '18px',
    borderRadius: 'full',
    bg: 'print.card',
    border: '2px solid',
    borderColor: 'print.ink',
    transition: 'transform 0.15s cubic-bezier(0.3, 1.4, 0.5, 1)',
    '&[data-state=checked]': { transform: 'translateX(20px)' },
  },
});
