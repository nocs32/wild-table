import { styled } from 'styled-system/jsx';

// The floating chat is a yellow legal pad, passed round the table: blue lines, a red margin, and a
// binding along the top. Position and size come from CSS variables set by useRoomChatWidget.
export const RoomChatWidgetRoot = styled('section', {
  base: {
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: '5',
    display: 'flex',
    flexDirection: 'column',
    width: 'var(--widget-width)',
    height: 'var(--widget-height)',
    borderRadius: '4px',
    overflow: 'hidden',
    bg: '#FFF7C4',
    bgImage: 'linear-gradient(90deg, transparent 49px, rgba(229, 72, 77, 0.45) 49px 50px, transparent 50px 53px, rgba(229, 72, 77, 0.45) 53px 54px, transparent 54px), repeating-linear-gradient(transparent 0 25px, rgba(77, 132, 196, 0.28) 25px 26px)',
    color: 'notebook.ink',
    boxShadow: 'paper',
    transform: 'translate3d(var(--widget-x), var(--widget-y), 0)',
    animation: 'fadeIn 0.15s ease-out',
    '&:hover [data-widget-resize], &:focus-within [data-widget-resize]': { opacity: '1' },
  },
  variants: {
    gesture: {
      idle: {},
      pressed: {},
      moving: { boxShadow: 'dialog', userSelect: 'none', transform: 'translate3d(var(--widget-x), var(--widget-y), 0) rotate(-1.5deg)', '& [data-widget-move]': { cursor: 'grabbing' } },
      resizing: { boxShadow: 'dialog', userSelect: 'none', cursor: 'nwse-resize' },
    },
  },
});

// The bottom-right grip. Shows on hover (always on touch screens).
export const RoomChatWidgetResize = styled('div', {
  base: {
    position: 'absolute',
    right: '0',
    bottom: '0',
    zIndex: '1',
    width: '20px',
    height: '20px',
    cursor: 'nwse-resize',
    touchAction: 'none',
    opacity: '0',
    transition: 'opacity 0.12s ease',
    '@media (hover: none)': { opacity: '1' },
    _after: {
      content: '""',
      position: 'absolute',
      right: '5px',
      bottom: '5px',
      width: '9px',
      height: '9px',
      borderRight: '2px solid',
      borderBottom: '2px solid',
      borderColor: 'notebook.muted',
      borderBottomRightRadius: '3px',
    },
  },
});

// "Too fast: send it again in a moment."
export const RoomChatComposerNote = styled('p', {
  base: { marginInline: '12px', marginBottom: '6px', fontSize: '12px', fontWeight: '900', color: 'stationery.stamp' },
});

// The drag handle: the pad's binding.
export const RoomChatHeader = styled('header', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    height: '42px',
    flexShrink: '0',
    paddingLeft: '14px',
    paddingRight: '6px',
    bg: '#8A3A33',
    bgImage: 'linear-gradient(rgba(255, 255, 255, 0.1), transparent 60%), repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.06) 0 2px, transparent 2px 5px)',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.25)',
    color: 'desk.chalk',
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none',
    '& button': { color: 'desk.chalkMuted', _hover: { bg: 'rgba(255, 255, 255, 0.12)', color: 'desk.chalk' } },
  },
});

export const RoomChatTitle = styled('h2', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '900',
    '& svg': { width: '16px', height: '16px', color: 'desk.chalkMuted' },
  },
});

// Write on the pad's last line, and send it.
export const RoomChatComposerRoot = styled('form', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: '0',
    marginLeft: '60px',
    marginRight: '10px',
    marginBottom: '10px',
    paddingBlock: '2px',
    borderBottom: '2px solid',
    borderColor: 'rgba(38, 37, 31, 0.45)',
    _focusWithin: { borderColor: 'accent.default' },
  },
});

export const RoomChatComposerInput = styled('input', {
  base: {
    flex: '1',
    minWidth: '0',
    height: '32px',
    bg: 'transparent',
    fontSize: '15px',
    outline: 'none',
    _placeholder: { color: 'notebook.muted' },
  },
});

export const RoomChatComposerSend = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '30px',
    marginBottom: '2px',
    borderRadius: '8px',
    color: 'notebook.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease, transform 0.12s ease',
    _disabled: { cursor: 'default', opacity: '0.5' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '16px', height: '16px', strokeWidth: '2.5' },
  },
  variants: {
    ready: {
      true: { bg: 'action.primary', color: 'fg.onAccent', boxShadow: '0 2px 0 {colors.grass.7}', _hover: { bg: 'action.primaryHover', transform: 'translateY(-1px)' } },
      false: {},
    },
  },
  defaultVariants: { ready: false },
});
