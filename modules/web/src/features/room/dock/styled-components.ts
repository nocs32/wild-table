import { Popover } from '@ark-ui/react/popover';
import { EmojiPicker } from 'frimousse';
import { styled } from 'styled-system/jsx';

// The card table's padded leather rail along the bottom: a brass edge, a stitched seam, the
// reactions as a row of poker chips, then the chat.
export const RoomDockRoot = styled('footer', {
  base: {
    position: 'relative',
    zIndex: '7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    minHeight: '62px',
    '@media (max-height: 540px)': { minHeight: '50px', gap: '10px' },
    paddingInline: '10px',
    paddingBottom: 'env(safe-area-inset-bottom)',
    bg: 'leather.base',
    bgImage: 'linear-gradient(90deg, transparent, rgba(255, 226, 170, 0.04) 50%, transparent), linear-gradient({colors.leather.light}, {colors.leather.base} 30%, {colors.leather.dark})',
    boxShadow: 'inset 0 2px 0 {colors.brass.light}, inset 0 3px 0 {colors.brass.deep}, 0 -6px 18px rgba(0, 0, 0, 0.5)',
    // The stitched seam just under the brass.
    _before: { content: '""', position: 'absolute', top: '8px', insetInline: '0', height: '1px', bgImage: 'repeating-linear-gradient(90deg, rgba(221, 189, 120, 0.45) 0 7px, transparent 7px 12px)' },
  },
  variants: {
    // On a phone held sideways height is scarce: the rail stands up along the left edge instead.
    rail: {
      true: {
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '0',
        flexDirection: 'column',
        gap: '10px',
        width: '58px',
        minHeight: '0',
        paddingInline: '0',
        paddingBlock: '8px',
        paddingLeft: 'env(safe-area-inset-left)',
        bgImage: 'linear-gradient({colors.leather.light}, {colors.leather.base} 30%, {colors.leather.dark})',
        boxShadow: 'inset -2px 0 0 {colors.brass.light}, inset -3px 0 0 {colors.brass.deep}, 6px 0 18px rgba(0, 0, 0, 0.5)',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '@media (max-height: 540px)': { minHeight: '0', gap: '8px' },
        _before: { top: '0', bottom: '0', insetInline: 'auto', right: '8px', width: '1px', height: 'auto', bgImage: 'repeating-linear-gradient(rgba(221, 189, 120, 0.45) 0 7px, transparent 7px 12px)' },
      },
      false: {},
    },
  },
  defaultVariants: { rail: false },
});

export const RoomDockChips = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '6px' },
  variants: {
    // Standing up, the rail has room for four quick emoji.
    rail: {
      true: { flexDirection: 'column', gap: '6px', '& > button:nth-child(n+5):not(:last-child)': { display: 'none' } },
      false: {},
    },
  },
  defaultVariants: { rail: false },
});

// A count of what came in while the chat was closed: a small red chip.
export const RoomDockBadge = styled('span', {
  base: {
    position: 'absolute',
    top: '-9px',
    right: '-9px',
    display: 'grid',
    placeItems: 'center',
    minWidth: '22px',
    height: '22px',
    paddingInline: '5px',
    borderRadius: 'full',
    bg: 'suit.red',
    border: '2px solid',
    borderColor: 'print.ink',
    color: 'print.card',
    fontFamily: 'display',
    fontSize: '11px',
    fontWeight: '800',
    animation: 'pop 0.35s ease-out',
  },
});

// Phones show just the icon.
export const RoomDockChatLabel = styled('span', {
  base: { display: 'none', sm: { display: 'inline' } },
});

export const RoomDockChatButton = styled('span', {
  base: { position: 'relative', display: 'inline-flex' },
});

// Each quick reaction is a poker chip with the emoji on its cream centre. Chips take turns at the
// four card colours and the wilds' black.
export const RoomDockEmoji = styled('button', {
  base: {
    '--chip': '{colors.suit.red}',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    borderRadius: 'full',
    bg: 'var(--chip)',
    bgImage: 'radial-gradient(circle, {colors.print.card} 0 52%, var(--chip) 52% 57%, transparent 57%), repeating-conic-gradient(from 12deg, rgba(255, 248, 232, 0.92) 0 22deg, var(--chip) 22deg 60deg)',
    boxShadow: '0 3px 0 rgba(0, 0, 0, 0.55), 0 5px 10px rgba(0, 0, 0, 0.35)',
    fontFamily: 'emoji',
    fontSize: '19px',
    lineHeight: '1',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
    _hover: { transform: 'translateY(-3px)', boxShadow: '0 6px 0 rgba(0, 0, 0, 0.55), 0 9px 14px rgba(0, 0, 0, 0.4)' },
    _active: { transform: 'translateY(2px)', boxShadow: '0 1px 0 rgba(0, 0, 0, 0.55)' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '&:nth-child(5n+2)': { '--chip': '{colors.suit.blue}' },
    '&:nth-child(5n+3)': { '--chip': '{colors.suit.green}' },
    '&:nth-child(5n+4)': { '--chip': '{colors.suit.yellowDeep}' },
    '&:nth-child(5n+5)': { '--chip': '{colors.suit.wild}' },
    // Phones show four quick emoji, on smaller chips.
    '&:nth-child(n+5)': { display: 'none', sm: { display: 'inline-flex' } },
    '@media (max-height: 540px)': { width: '36px', height: '36px', fontSize: '16px' },
  },
});

// More emoji: an empty slot in the chip rack.
export const RoomDockButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '42px',
    height: '42px',
    borderRadius: 'full',
    border: '2px dashed',
    borderColor: 'border.strong',
    bg: 'rgba(0, 0, 0, 0.25)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
    color: 'chrome.fg',
    cursor: 'pointer',
    transition: 'color 0.12s ease, border-color 0.12s ease',
    _hover: { color: 'chrome.fgStrong', borderColor: 'brass.light' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '&[aria-pressed=true], &[data-state=open]': { color: 'accent.text', borderColor: 'accent.default', borderStyle: 'solid' },
    '& svg': { width: '20px', height: '20px' },
    '@media (max-height: 540px)': { width: '36px', height: '36px' },
  },
});

export const RoomDockPopover = styled(Popover.Content, {
  base: {
    zIndex: '40',
    borderRadius: '14px',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'dialog',
    outline: 'none',
    '&[data-state=open]': { animation: 'dialogIn 0.15s ease-out' },
  },
  variants: {
    padded: {
      true: { display: 'grid', gap: '10px', width: '260px', padding: '14px' },
      false: {},
    },
  },
  defaultVariants: { padded: false },
});

export const RoomDockPickerRoot = styled(EmojiPicker.Root, {
  base: { display: 'flex', flexDirection: 'column', width: '348px', maxWidth: 'calc(100vw - 24px)', height: '380px' },
});

export const RoomDockPickerSearch = styled(EmojiPicker.Search, {
  base: {
    flexShrink: '0',
    height: '34px',
    margin: '10px',
    marginBottom: '6px',
    paddingInline: '10px',
    borderRadius: '8px',
    bg: 'bg.subtle',
    boxShadow: 'inset 0 0 0 1px {colors.border.default}',
    fontSize: '14px',
    outline: 'none',
    _placeholder: { color: 'fg.subtle' },
    _focus: { boxShadow: 'inset 0 0 0 1px {colors.accent.ring}' },
  },
});

// Frimousse renders the list itself; its parts are styled through their attributes.
export const RoomDockPickerViewport = styled(EmojiPicker.Viewport, {
  base: {
    position: 'relative',
    flex: '1',
    minHeight: '0',
    outline: 'none',
    overscrollBehavior: 'contain',
    '& [frimousse-list]': { paddingBottom: '6px' },
    '& [frimousse-category-header]': {
      paddingInline: '12px',
      paddingTop: '8px',
      paddingBottom: '4px',
      bg: 'bg.surface',
      color: 'fg.muted',
      fontSize: '12px',
      fontWeight: '700',
    },
    '& [frimousse-row]': { paddingInline: '8px' },
    '& [frimousse-emoji]': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      fontFamily: 'emoji',
      fontSize: '22px',
      cursor: 'pointer',
      '&[data-active]': { bg: 'bg.hover' },
    },
  },
});

export const RoomDockPickerLoading = styled(EmojiPicker.Loading, {
  base: { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', fontSize: '13px', color: 'fg.muted' },
});

export const RoomDockPickerEmpty = styled(EmojiPicker.Empty, {
  base: { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', fontSize: '13px', color: 'fg.muted' },
});

export const RoomDockPickerFooter = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: '0',
    height: '44px',
    paddingInline: '12px',
    borderTop: '1px solid',
    borderColor: 'border.subtle',
    fontSize: '13px',
    color: 'fg.muted',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const RoomDockPickerActive = styled('span', {
  base: { fontFamily: 'emoji', fontSize: '22px', lineHeight: '1' },
});
