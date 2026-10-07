import { Popover } from '@ark-ui/react/popover';
import { styled } from 'styled-system/jsx';

// Everyone's initial on a round sticker in their colour.
export const AvatarRoot = styled('span', {
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    borderRadius: 'full',
    color: 'fg.onAccent',
    fontWeight: '900',
    lineHeight: '1',
    boxShadow: 'sticker',
    userSelect: 'none',
  },
  variants: {
    tone: {
      raspberry: { bg: 'player.raspberry' },
      sky: { bg: 'player.sky' },
      green: { bg: 'player.green' },
      mustard: { bg: 'player.mustard', color: 'sand.1' },
      violet: { bg: 'player.violet' },
      orange: { bg: 'player.orange' },
      teal: { bg: 'player.teal' },
      pink: { bg: 'player.pink' },
      lime: { bg: 'player.lime', color: 'sand.1' },
      indigo: { bg: 'player.indigo' },
    },
    size: {
      sm: { width: '20px', height: '20px', fontSize: '11px', boxShadow: '0 0 0 1.5px #FFFFFF, 0 2px 4px rgba(0, 0, 0, 0.4)' },
      md: { width: '26px', height: '26px', fontSize: '13px' },
      lg: { width: '36px', height: '36px', fontSize: '16px' },
    },
    ring: {
      true: { boxShadow: '0 0 0 2px #FFFFFF, 0 0 0 3.5px {colors.chrome.app}' },
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
    borderColor: 'white',
  },
  variants: {
    status: {
      online: { bg: 'presence.online' },
      reconnecting: { bg: 'white', boxShadow: 'inset 0 0 0 1.5px {colors.notebook.muted}' },
    },
  },
});

// A paper cut-out lying on the desk: --edge is the thickness you see under it. It lifts as you
// point at it and presses flat as you click.
export const Button = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: '38px',
    paddingInline: '16px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '900',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, transform 0.1s ease, box-shadow 0.1s ease',
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '3px' },
    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
    '& svg': { width: '16px', height: '16px', strokeWidth: '2.5' },
    boxShadow: '0 3px 0 var(--edge), 0 6px 12px rgba(0, 0, 0, 0.28)',
    '&:hover:not(:disabled)': { transform: 'translateY(-1px)', boxShadow: '0 4px 0 var(--edge), 0 8px 14px rgba(0, 0, 0, 0.3)' },
    '&:active:not(:disabled)': { transform: 'translateY(2px)', boxShadow: '0 1px 0 var(--edge), 0 2px 4px rgba(0, 0, 0, 0.25)' },
  },
  variants: {
    tone: {
      primary: { '--edge': '{colors.grass.7}', bg: 'action.primary', color: 'fg.onAccent', _hover: { bg: 'action.primaryHover' } },
      secondary: { '--edge': '#BDB49F', bg: 'notebook.paper', color: 'notebook.ink', _hover: { bg: 'stationery.card' } },
      ghost: {
        bg: 'transparent',
        color: 'fg.default',
        boxShadow: 'none',
        _hover: { bg: 'bg.hover' },
        '&:hover:not(:disabled)': { transform: 'none', boxShadow: 'none' },
        '&:active:not(:disabled)': { transform: 'none', boxShadow: 'none' },
      },
      danger: { '--edge': '#9E2428', bg: 'danger', color: 'fg.onAccent' },
    },
    size: {
      md: {},
      sm: { height: '30px', paddingInline: '12px', fontSize: '13px', borderRadius: '8px' },
    },
  },
  defaultVariants: { tone: 'secondary', size: 'md' },
});

export const IconButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    color: 'fg.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _hover: { bg: 'bg.hover', color: 'fg.default' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed', _hover: { bg: 'transparent', color: 'fg.muted' } },
    '&[aria-pressed=true]': { bg: 'accent.tint', color: 'accent.text' },
    '& svg': { width: '18px', height: '18px' },
  },
});

export const ConfirmPopoverContent = styled(Popover.Content, {
  base: {
    zIndex: '40',
    display: 'grid',
    gap: '12px',
    width: '260px',
    maxWidth: 'calc(100vw - 24px)',
    padding: '14px',
    borderRadius: '12px',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'dialog',
    outline: 'none',
    '&[data-state=open]': { animation: 'dialogIn 0.15s ease-out' },
  },
});

export const ConfirmPopoverText = styled('div', {
  base: { display: 'grid', gap: '4px' },
});

export const ConfirmPopoverTitle = styled('p', {
  base: { fontSize: '15px', fontWeight: '900' },
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
    _after: {
      content: 'attr(data-value)',
      gridArea: '1 / 1',
      visibility: 'hidden',
      whiteSpace: 'pre',
      overflow: 'hidden',
      paddingInline: '6px',
      font: 'inherit',
    },
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
    borderRadius: '6px',
    bg: 'transparent',
    color: 'inherit',
    font: 'inherit',
    letterSpacing: 'inherit',
    textOverflow: 'ellipsis',
    outline: 'none',
    transition: 'background-color 0.12s ease, box-shadow 0.12s ease',
    _placeholder: { color: 'fg.subtle' },
    _hover: { bg: 'bg.hover' },
    _focus: { bg: 'bg.subtle', boxShadow: 'inset 0 0 0 1px {colors.accent.ring}', textOverflow: 'clip' },
  },
  variants: {
    tone: {
      heading: { height: '30px', marginInlineStart: '-2px' },
      field: {
        height: '34px',
        paddingInline: '10px',
        bg: 'bg.subtle',
        boxShadow: 'inset 0 0 0 1px {colors.border.default}',
        _hover: { bg: 'bg.subtle', boxShadow: 'inset 0 0 0 1px {colors.border.strong}' },
      },
    },
  },
  defaultVariants: { tone: 'heading' },
});
