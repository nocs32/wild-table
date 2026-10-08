import { styled } from 'styled-system/jsx';

// The round over the 3D table: the turn's prompt at the top, captions under it, the fuse along your
// edge, and between rounds the scores or the podium. Only these take clicks: the rest goes through
// to the table.
export const RoomRoundRoot = styled('div', {
  base: {
    position: 'absolute',
    inset: '0',
    zIndex: '2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '10px',
    paddingInline: '12px',
    pointerEvents: 'none',
    '@media (max-height: 540px)': { paddingTop: '6px', gap: '5px' },
  },
  variants: {
    // A phone held sideways: the prompt and the captions keep to the top right, out of the way of
    // the far seat, and the dock's rail keeps the left.
    compact: {
      true: {
        alignItems: 'flex-end',
        paddingLeft: '66px',
        '& > section, & > ul': { width: 'min(380px, 50vw)' },
        '& h2': { fontSize: '14.5px' },
        '& section p': { fontSize: '12px', lineHeight: '1.3' },
        // Only the latest caption: there's no room for a stack.
        '& > ul > li:not(:last-child)': { display: 'none' },
      },
      false: {},
    },
  },
  defaultVariants: { compact: false },
});

// The turn's prompt: a printed plate saying whose turn it is and what it's waiting for, with the
// buttons when it's yours. Lit up when it's you.
export const RoomRoundTurnRoot = styled('section', {
  base: {
    display: 'grid',
    gap: '6px',
    width: 'min(560px, 100%)',
    paddingBlock: '10px',
    paddingInline: '16px',
    borderRadius: '16px',
    border: '2px solid',
    borderColor: 'print.ink',
    bg: 'print.card',
    color: 'print.ink',
    boxShadow: 'print',
    pointerEvents: 'auto',
    animation: 'dialogIn 0.25s ease-out',
    '@media (max-height: 540px)': { paddingBlock: '6px', paddingInline: '12px', gap: '4px', width: 'min(520px, 100%)' },
  },
  variants: {
    mine: {
      true: { borderColor: 'lamp.deep', animation: 'turnGlow 1.6s ease-in-out infinite' },
      false: {},
    },
  },
  defaultVariants: { mine: false },
});

export const RoomRoundTurnHead = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' },
});

export const RoomRoundTurnTitle = styled('h2', {
  base: { fontFamily: 'display', fontWeight: '900', fontSize: '18px', lineHeight: '1.15', '@media (max-height: 540px)': { fontSize: '16px' } },
});

export const RoomRoundTurnTime = styled('span', {
  base: { flexShrink: '0', fontFamily: 'display', fontWeight: '800', fontSize: '14px', fontVariantNumeric: 'tabular-nums', color: 'print.muted' },
  variants: {
    urgent: { true: { color: 'suit.red' }, false: {} },
  },
  defaultVariants: { urgent: false },
});

export const RoomRoundTurnHint = styled('p', {
  base: { fontSize: '13.5px', lineHeight: '1.35', color: 'print.muted', '@media (max-height: 540px)': { fontSize: '13px' } },
});

export const RoomRoundTurnActions = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '2px' },
});

// A colour to pick after a Wild: a chunky button in that colour, with its symbol (D22).
export const RoomRoundTurnColour = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '40px',
    paddingInline: '14px',
    borderRadius: '12px',
    border: '2px solid',
    borderColor: 'print.ink',
    color: 'print.card',
    fontFamily: 'display',
    fontWeight: '800',
    fontSize: '15px',
    textShadow: '0 1px 1px rgba(0, 0, 0, 0.35)',
    boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.35), 0 4px 0 {colors.print.ink}',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
    '& svg': { width: '18px', height: '18px' },
    '&:hover': { transform: 'translateY(-1px)' },
    '&:active': { transform: 'translateY(3px)', boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.3), 0 1px 0 {colors.print.ink}' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '3px' },
  },
  variants: {
    suit: {
      red: { bg: 'suit.red' },
      yellow: { bg: 'suit.yellow', color: 'print.ink', textShadow: 'none' },
      green: { bg: 'suit.green' },
      blue: { bg: 'suit.blue' },
    },
  },
});

// What just happened, a line at a time (spec D7), under the prompt.
export const RoomRoundCaptionsList = styled('ul', {
  base: { display: 'grid', justifyItems: 'center', gap: '6px', width: 'min(560px, 100%)' },
});

export const RoomRoundCaptionsItemRoot = styled('li', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    paddingBlock: '6px',
    paddingInline: '12px',
    borderRadius: '12px',
    bg: 'rgba(20, 13, 9, 0.88)',
    border: '1px solid',
    borderColor: 'brass.deep',
    color: 'fg.default',
    fontSize: '13.5px',
    lineHeight: '1.35',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.45)',
    pointerEvents: 'auto',
    animation: 'dialogIn 0.2s ease-out',
  },
  variants: {
    why: { true: { borderColor: 'suit.red', animation: 'shake 0.4s ease-out' }, false: {} },
  },
  defaultVariants: { why: false },
});

export const RoomRoundCaptionsItemLink = styled('button', {
  base: { fontWeight: '700', color: 'brass.light', textDecoration: 'underline', cursor: 'pointer', _hover: { color: 'brass.shine' } },
});

export const RoomRoundCaptionsItemCards = styled('span', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '3px', '& img': { width: '30px', height: '42px', borderRadius: '4px' } },
});

// Your fuse (D11): it burns along your edge of the screen in your turn's last 8 seconds.
export const RoomRoundFuseRoot = styled('div', {
  base: {
    '--fuse': '1',
    position: 'absolute',
    left: '0',
    right: '0',
    bottom: '0',
    height: '6px',
    bg: 'rgba(0, 0, 0, 0.4)',
    pointerEvents: 'none',
    _before: {
      content: '""',
      position: 'absolute',
      left: '0',
      top: '0',
      bottom: '0',
      width: 'calc(var(--fuse) * 100%)',
      bgImage: 'linear-gradient(90deg, {colors.lamp.deep}, {colors.lamp.warm} 70%, {colors.suit.red})',
      transition: 'width 0.25s linear',
    },
    _after: {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: 'calc(var(--fuse) * 100%)',
      width: '16px',
      height: '16px',
      marginTop: '-8px',
      marginLeft: '-8px',
      borderRadius: 'full',
      bg: 'lamp.glow',
      boxShadow: '0 0 12px 4px {colors.lamp.warm}, 0 0 24px 8px rgba(226, 65, 47, 0.6)',
      transition: 'left 0.25s linear',
      animation: 'pulse 0.25s ease-in-out infinite',
    },
  },
});
