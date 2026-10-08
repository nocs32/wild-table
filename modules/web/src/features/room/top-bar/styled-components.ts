import { Popover } from '@ark-ui/react/popover';
import { styled } from 'styled-system/jsx';

// The basement's walnut panelling along the top, with a brass strip under it.
export const RoomTopBarRoot = styled('header', {
  base: {
    position: 'relative',
    zIndex: '8',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '12px',
    paddingInline: '12px',
    bg: 'wood.dark',
    bgImage: 'repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.14) 0 1px, transparent 1px 9px, rgba(255, 220, 170, 0.03) 9px 10px, transparent 10px 23px), linear-gradient({colors.wood.base}, {colors.wood.dark})',
    boxShadow: 'inset 0 -2px 0 {colors.brass.deep}, inset 0 -3px 0 {colors.brass.light}, 0 4px 14px rgba(0, 0, 0, 0.55)',
    color: 'chrome.fgStrong',
    md: { gridTemplateColumns: '1fr minmax(0, 440px) 1fr' },
  },
});

export const RoomTopBarStart = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '0' },
});

// While the connection is down and the table holds your seat.
export const RoomTopBarReconnecting = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '24px',
    paddingInline: '8px',
    borderRadius: 'full',
    bg: 'accent.tint',
    color: 'accent.text',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    '& svg': { width: '12px', height: '12px', animation: 'spin' },
    _motionReduce: { '& svg': { animation: 'none' } },
  },
});

export const RoomTopBarEnd = styled('div', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' },
});

export const RoomTopBarBrand = styled('div', {
  base: {
    display: 'none',
    alignItems: 'center',
    gap: '9px',
    paddingInline: '2px',
    fontFamily: 'display',
    fontSize: '17px',
    fontWeight: '800',
    letterSpacing: '0.01em',
    color: 'print.card',
    textShadow: '0 2px 0 rgba(0, 0, 0, 0.45)',
    whiteSpace: 'nowrap',
    sm: { display: 'flex' },
    '& svg': { width: '28px', height: '28px', flexShrink: '0', filter: 'drop-shadow(0 2px 0 rgba(0, 0, 0, 0.45))' },
  },
});

// The language on a cream poker chip.
export const RoomTopBarLanguage = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: 'full',
    bg: 'print.card',
    bgImage: 'radial-gradient(circle, {colors.print.card} 0 56%, transparent 56%), repeating-conic-gradient(from 12deg, {colors.suit.red} 0 22deg, {colors.print.card} 22deg 60deg)',
    color: 'print.ink',
    fontFamily: 'display',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.02em',
    boxShadow: 'chip',
    cursor: 'pointer',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'translateY(-1px)' },
    _active: { transform: 'translateY(1px)' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});

// Phones show just the icon.
export const RoomTopBarButtonLabel = styled('span', {
  base: { display: 'none', sm: { display: 'inline' } },
});

// The table's link on a cream ticket stub: notches cut in both ends, and a torn-off part to copy it.
export const RoomTopBarLinkRoot = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    height: '32px',
    paddingInline: '16px',
    borderRadius: '4px',
    bg: 'print.card',
    bgImage: 'linear-gradient(rgba(255, 255, 255, 0.5), transparent 60%)',
    color: 'print.ink',
    fontSize: '13px',
    fontWeight: '600',
    maskImage: 'radial-gradient(circle at 0 50%, transparent 7px, black 7.5px), radial-gradient(circle at 100% 50%, transparent 7px, black 7.5px)',
    maskSize: '51% 100%',
    maskPosition: 'left, right',
    maskRepeat: 'no-repeat',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    _hover: { bg: 'white' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '14px', height: '14px', flexShrink: '0', color: 'print.muted' },
  },
});

export const RoomTopBarLinkText = styled('span', {
  base: { flex: '1', minWidth: '0', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

// The stub you'd tear off: copies the link.
export const RoomTopBarLinkHint = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: '5px',
    flexShrink: '0',
    paddingLeft: '12px',
    borderLeft: '2px dashed',
    borderColor: 'print.line',
    fontFamily: 'display',
    fontSize: '12px',
    fontWeight: '800',
    color: 'suit.redDeep',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    '& svg': { width: '13px', height: '13px', color: 'suit.redDeep' },
  },
});

export const RoomTopBarLinkHintLabel = styled('span', {
  base: { display: 'none', sm: { display: 'inline' } },
});

// The demo table's buttons, next to the brand. Desktop only: it's a tool for trying the game alone.
export const RoomTopBarDemoRoot = styled('div', {
  base: {
    display: 'none',
    alignItems: 'center',
    gap: '2px',
    marginLeft: '8px',
    paddingLeft: '4px',
    paddingRight: '2px',
    borderRadius: '8px',
    border: '1px dashed',
    borderColor: 'border.strong',
    md: { display: 'flex' },
  },
});

export const RoomTopBarDemoLabel = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    paddingInline: '6px',
    fontSize: '11px',
    fontWeight: '800',
    color: 'chrome.fg',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    '& svg': { width: '13px', height: '13px' },
  },
});

// The speaker that opens the sound settings.
export const RoomTopBarSoundTrigger = styled(Popover.Trigger, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    color: 'chrome.fg',
    cursor: 'pointer',
    _hover: { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '&[data-state=open]': { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    '& svg': { width: '18px', height: '18px' },
  },
  variants: {
    muted: {
      true: { color: 'fg.subtle' },
      false: {},
    },
  },
  defaultVariants: { muted: false },
});

export const RoomTopBarSoundPanelTitle = styled('p', {
  base: { fontFamily: 'display', fontSize: '16px', fontWeight: '800' },
});
