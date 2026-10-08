import { Popover } from '@ark-ui/react/popover';
import { styled } from 'styled-system/jsx';

// Everyone's initial on a poker chip in their colour: a cream rim with edge spots, and the chip's
// thickness under it.
export const AvatarRoot = styled('span', {
  base: {
    '--chip': '{colors.player.indigo}',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    borderRadius: 'full',
    bg: 'var(--chip)',
    bgImage: 'radial-gradient(circle, var(--chip) 0 53%, rgba(255, 248, 232, 0.92) 53% 58%, transparent 58%), repeating-conic-gradient(from 12deg, rgba(255, 248, 232, 0.94) 0 22deg, var(--chip) 22deg 60deg)',
    color: 'print.card',
    fontFamily: 'display',
    fontWeight: '800',
    lineHeight: '1',
    textShadow: '0 1px 1px rgba(0, 0, 0, 0.35)',
    boxShadow: 'chip',
    userSelect: 'none',
  },
  variants: {
    tone: {
      raspberry: { '--chip': '{colors.player.raspberry}' },
      sky: { '--chip': '{colors.player.sky}' },
      green: { '--chip': '{colors.player.green}' },
      mustard: { '--chip': '{colors.player.mustard}' },
      violet: { '--chip': '{colors.player.violet}' },
      orange: { '--chip': '{colors.player.orange}' },
      teal: { '--chip': '{colors.player.teal}' },
      pink: { '--chip': '{colors.player.pink}' },
      lime: { '--chip': '{colors.player.lime}' },
      indigo: { '--chip': '{colors.player.indigo}' },
    },
    size: {
      sm: { width: '20px', height: '20px', fontSize: '9px', boxShadow: '0 1px 0 rgba(0, 0, 0, 0.4)' },
      md: { width: '28px', height: '28px', fontSize: '12px' },
      lg: { width: '36px', height: '36px', fontSize: '15px' },
    },
    ring: {
      true: { boxShadow: '0 0 0 2px {colors.room.night}, 0 2px 0 2px rgba(0, 0, 0, 0.4)' },
      false: {},
    },
  },
  defaultVariants: { tone: 'indigo', size: 'md', ring: false },
});

export const AvatarPresence = styled('span', {
  base: {
    position: 'absolute',
    right: '-3px',
    bottom: '-3px',
    width: '10px',
    height: '10px',
    borderRadius: 'full',
    border: '2px solid',
    borderColor: 'room.night',
  },
  variants: {
    status: {
      online: { bg: 'presence.online' },
      reconnecting: { bg: 'room.haze', boxShadow: 'inset 0 0 0 1.5px {colors.fg.subtle}' },
    },
  },
});

// A bot's 🤖, pinned to the chip's edge.
export const AvatarBot = styled('span', {
  base: { position: 'absolute', right: '-5px', top: '-5px', fontFamily: 'emoji', fontSize: '11px', lineHeight: '1', filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5))' },
});

// An arcade button: a chunky outline, the button's thickness in ink under it, and a glossy top. It
// lifts as you point at it and presses down as you click.
export const Button = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: '40px',
    paddingInline: '18px',
    borderRadius: '12px',
    border: '2px solid',
    borderColor: 'print.ink',
    fontFamily: 'display',
    fontSize: '15px',
    fontWeight: '800',
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, transform 0.1s ease, box-shadow 0.1s ease',
    boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.45), 0 4px 0 {colors.print.ink}',
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '3px' },
    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
    '& svg': { width: '17px', height: '17px', strokeWidth: '2.5', flexShrink: '0' },
    '&:hover:not(:disabled)': { transform: 'translateY(-1px)', boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.45), 0 5px 0 {colors.print.ink}' },
    '&:active:not(:disabled)': { transform: 'translateY(3px)', boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.3), 0 1px 0 {colors.print.ink}' },
  },
  variants: {
    tone: {
      primary: { bg: 'action.primary', color: 'print.ink', _hover: { bg: 'action.primaryHover' } },
      secondary: { bg: 'print.card', color: 'print.ink', _hover: { bg: 'white' } },
      ghost: {
        borderColor: 'transparent',
        bg: 'transparent',
        color: 'inherit',
        boxShadow: 'none',
        _hover: { bg: 'bg.hover' },
        '&:hover:not(:disabled)': { transform: 'none', boxShadow: 'none' },
        '&:active:not(:disabled)': { transform: 'none', boxShadow: 'none' },
      },
      danger: { bg: 'suit.red', color: 'print.card' },
    },
    size: {
      md: {},
      sm: { height: '32px', paddingInline: '12px', fontSize: '13px', borderRadius: '10px', '& svg': { width: '15px', height: '15px' } },
      lg: { height: '54px', paddingInline: '28px', fontSize: '20px', borderRadius: '16px', borderWidth: '3px', '& svg': { width: '22px', height: '22px' } },
    },
  },
  defaultVariants: { tone: 'secondary', size: 'md' },
});

// A small icon button, on the room's wood or on printed card stock.
export const IconButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    color: 'chrome.fg',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _hover: { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed', _hover: { bg: 'transparent', color: 'chrome.fg' } },
    '&[aria-pressed=true]': { bg: 'accent.tint', color: 'accent.text' },
    '& svg': { width: '18px', height: '18px' },
  },
  variants: {
    surface: {
      room: {},
      print: { color: 'print.muted', _hover: { bg: 'rgba(34, 23, 14, 0.08)', color: 'print.ink' } },
    },
  },
  defaultVariants: { surface: 'room' },
});

// The room's popovers: a dark panel with a brass hairline.
export const PanelContent = styled(Popover.Content, {
  base: {
    zIndex: '40',
    display: 'grid',
    width: '288px',
    maxWidth: 'calc(100vw - 24px)',
    borderRadius: '14px',
    bg: 'bg.surface',
    bgImage: 'linear-gradient(rgba(255, 226, 170, 0.04), transparent 40%)',
    color: 'fg.default',
    boxShadow: 'dialog',
    outline: 'none',
    '&[data-state=open]': { animation: 'dialogIn 0.15s ease-out' },
  },
  variants: {
    padded: {
      true: { gap: '16px', padding: '16px' },
      false: { paddingBlock: '8px' },
    },
  },
  defaultVariants: { padded: true },
});

export const ConfirmPopoverText = styled('div', {
  base: { display: 'grid', gap: '4px' },
});

export const ConfirmPopoverTitle = styled('p', {
  base: { fontFamily: 'display', fontSize: '15px', fontWeight: '800' },
});

export const ConfirmPopoverNote = styled('p', {
  base: { fontSize: '13px', color: 'fg.muted' },
});

export const ConfirmPopoverButtons = styled('div', {
  base: { display: 'flex', justifyContent: 'flex-end', gap: '8px' },
});

// Auto-sizing inline input: the ::after copy of the text sets the width, the input sits on top.
export const NameInputSizer = styled('span', {
  base: {
    display: 'inline-grid',
    minWidth: '0',
    maxWidth: '100%',
    _after: { content: 'attr(data-value)', gridArea: '1 / 1', visibility: 'hidden', whiteSpace: 'pre', overflow: 'hidden', paddingInline: '6px', font: 'inherit' },
  },
  variants: {
    tone: {
      heading: {},
      field: { display: 'grid', width: '100%' },
    },
  },
  defaultVariants: { tone: 'heading' },
});

export const NameInputField = styled('input', {
  base: {
    gridArea: '1 / 1',
    width: '100%',
    minWidth: '0',
    paddingInline: '6px',
    borderRadius: '8px',
    bg: 'transparent',
    color: 'inherit',
    font: 'inherit',
    letterSpacing: 'inherit',
    textOverflow: 'ellipsis',
    outline: 'none',
    transition: 'background-color 0.12s ease, box-shadow 0.12s ease',
    _placeholder: { color: 'fg.subtle' },
    _hover: { bg: 'bg.hover' },
    _focus: { bg: 'chrome.field', boxShadow: 'inset 0 0 0 1.5px {colors.accent.default}', textOverflow: 'clip' },
  },
  variants: {
    tone: {
      heading: { height: '30px', marginInlineStart: '-2px' },
      field: {
        height: '36px',
        paddingInline: '10px',
        bg: 'chrome.field',
        boxShadow: 'inset 0 0 0 1px {colors.border.default}, inset 0 2px 4px rgba(0, 0, 0, 0.35)',
        _hover: { bg: 'chrome.field', boxShadow: 'inset 0 0 0 1px {colors.border.strong}, inset 0 2px 4px rgba(0, 0, 0, 0.35)' },
      },
    },
  },
  defaultVariants: { tone: 'heading' },
});
