import { Popover } from '@ark-ui/react/popover';
import { EmojiPicker } from 'frimousse';
import { styled } from 'styled-system/jsx';

// The front edge of the desk: a sheet of reaction stickers, then the chat.
export const RoomDockRoot = styled('footer', {
  base: {
    position: 'relative',
    zIndex: '7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    minHeight: '60px',
    paddingInline: '8px',
    paddingBottom: 'env(safe-area-inset-bottom)',
    borderTop: '1px solid',
    borderColor: 'rgba(255, 255, 240, 0.06)',
    bg: 'desk.edge',
  },
});

// The quick reactions as round stickers on a strip of backing paper.
export const RoomDockSheet = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    paddingInline: '6px',
    paddingBlock: '4px',
    borderRadius: '8px',
    bg: 'stationery.backing',
    bgImage: 'linear-gradient(rgba(255, 255, 255, 0.5), transparent)',
    boxShadow: '0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 6px 14px rgba(0, 0, 0, 0.45)',
    transform: 'rotate(-0.6deg)',
  },
});

// The chat as a folded note, with a sticker counting what came in while it was closed (spec §7).
export const RoomDockChatButton = styled('button', {
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '40px',
    paddingLeft: '12px',
    paddingRight: '18px',
    borderRadius: '3px',
    bg: 'notebook.paper',
    bgImage: 'linear-gradient(225deg, {colors.desk.edge} 0 9px, {colors.notebook.paperShade} 9px 13px, transparent 13px)',
    color: 'notebook.ink',
    fontSize: '14px',
    fontWeight: '900',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.45)',
    transform: 'rotate(1.5deg)',
    cursor: 'pointer',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'rotate(-1deg) translateY(-2px)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '&[aria-pressed=true]': { bg: 'stationery.sticky', transform: 'rotate(-1deg) translateY(-3px)' },
    '& svg': { width: '18px', height: '18px', strokeWidth: '2.25' },
  },
});

export const RoomDockChatLabel = styled('span', {
  base: { display: 'none', sm: { display: 'inline' } },
});

export const RoomDockBadge = styled('span', {
  base: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    display: 'grid',
    placeItems: 'center',
    minWidth: '22px',
    height: '22px',
    paddingInline: '5px',
    borderRadius: 'full',
    bg: 'stationery.stamp',
    color: 'fg.onAccent',
    fontFamily: 'body',
    fontSize: '12px',
    fontWeight: '900',
    boxShadow: 'sticker',
    transform: 'rotate(8deg)',
    animation: 'pop 0.35s ease-out',
  },
});

// Each quick reaction is a die-cut sticker: it lifts and tilts as if you were peeling it off.
export const RoomDockEmoji = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: 'full',
    bg: 'white',
    boxShadow: '0 0 0 1px rgba(38, 37, 31, 0.12), 0 1px 2px rgba(38, 37, 31, 0.25)',
    fontFamily: 'emoji',
    fontSize: '22px',
    lineHeight: '1',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
    _hover: { transform: 'translateY(-3px) rotate(-10deg) scale(1.1)', boxShadow: '0 0 0 1px rgba(38, 37, 31, 0.12), 0 6px 10px rgba(38, 37, 31, 0.3)' },
    _active: { transform: 'scale(0.92)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    // Phones show four quick emoji.
    '&:nth-child(n+5)': { display: 'none', sm: { display: 'inline-flex' } },
  },
});

// More emoji: an empty sticker slot on the sheet.
export const RoomDockButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '38px',
    height: '38px',
    borderRadius: 'full',
    border: '2px dashed',
    borderColor: 'rgba(38, 37, 31, 0.3)',
    color: 'notebook.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease',
    _hover: { bg: 'white', color: 'notebook.ink', borderColor: 'rgba(38, 37, 31, 0.5)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed' },
    '&[aria-pressed=true], &[data-state=open]': { bg: 'white', color: 'accent.default', borderColor: 'accent.default' },
    '& svg': { width: '20px', height: '20px' },
  },
});

export const RoomDockPopover = styled(Popover.Content, {
  base: {
    zIndex: '40',
    borderRadius: '12px',
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
