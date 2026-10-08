import { styled } from 'styled-system/jsx';

// The labels standing in the 3D table (drei's Html): each player's place card, and the bell's sign.

// A player's place at the table: their chip, and a printed name plate with their cards and score.
// It glows lamp-gold on their turn.
export const RoomTableRoundSeatRoot = styled('div', {
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px 4px 4px',
    borderRadius: 'full',
    bg: 'print.card',
    color: 'print.ink',
    border: '2px solid',
    borderColor: 'print.line',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.45)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    '@media (max-height: 540px)': { padding: '2px 8px 2px 2px', gap: '4px' },
  },
  variants: {
    turn: {
      true: { borderColor: 'lamp.glow', animation: 'turnGlow 1.6s ease-in-out infinite' },
      false: {},
    },
  },
  defaultVariants: { turn: false },
});

export const RoomTableRoundSeatChip = styled('button', {
  base: {
    display: 'inline-flex',
    borderRadius: 'full',
    cursor: 'pointer',
    transition: 'transform 0.12s',
    _hover: { transform: 'scale(1.08)' },
    _focusVisible: { outline: '2px solid {colors.lamp.glow}', outlineOffset: '2px' },
  },
});

export const RoomTableRoundSeatText = styled('div', {
  base: { display: 'grid', lineHeight: '1.15' },
});

export const RoomTableRoundSeatName = styled('span', {
  base: { maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'display', fontWeight: '800', fontSize: '13px', '@media (max-height: 540px)': { fontSize: '12px', maxWidth: '90px' } },
});

export const RoomTableRoundSeatStats = styled('span', {
  base: { fontSize: '11.5px', fontWeight: '600', color: 'print.muted', '@media (max-height: 540px)': { fontSize: '11px' } },
});

// "Last card!" on someone down to one card while the race is open.
export const RoomTableRoundSeatTag = styled('span', {
  base: {
    position: 'absolute',
    top: '-11px',
    right: '-6px',
    paddingInline: '7px',
    paddingBlock: '2px',
    borderRadius: 'full',
    bg: 'suit.red',
    color: 'print.card',
    fontFamily: 'display',
    fontWeight: '800',
    fontSize: '10.5px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
    animation: 'pulse 0.9s ease-in-out infinite',
  },
});

// An emote's speech bubble, over the place card.
export const RoomTableRoundSeatBubble = styled('span', {
  base: {
    position: 'absolute',
    bottom: 'calc(100% + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    paddingInline: '12px',
    paddingBlock: '6px',
    borderRadius: '14px',
    bg: 'print.card',
    color: 'print.ink',
    fontFamily: 'display',
    fontWeight: '800',
    fontSize: '14px',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
    animation: 'dialogIn 0.2s ease-out',
    _after: {
      content: '""',
      position: 'absolute',
      top: '100%',
      left: '50%',
      marginLeft: '-7px',
      borderWidth: '7px 7px 0',
      borderStyle: 'solid',
      borderColor: '{colors.print.card} transparent transparent',
    },
  },
});

// The emote wheel's lines, in the popover from your own chip.
export const RoomTableRoundSeatEmotesList = styled('div', {
  base: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px' },
});

export const RoomTableRoundSeatEmotesTitle = styled('p', {
  base: { fontFamily: 'display', fontWeight: '800', fontSize: '14px', color: 'fg.default' },
});

// The sign over the bell while it can be hit: a chunky red arcade button.
export const RoomTableRoundBellSign = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    paddingInline: '14px',
    paddingBlock: '7px',
    borderRadius: 'full',
    bg: 'suit.red',
    color: 'print.card',
    fontFamily: 'display',
    fontWeight: '900',
    fontSize: '15px',
    whiteSpace: 'nowrap',
    border: '2px solid',
    borderColor: 'print.card',
    boxShadow: '0 4px 0 {colors.suit.redDeep}, 0 8px 18px rgba(0, 0, 0, 0.5)',
    cursor: 'pointer',
    animation: 'pulse 0.8s ease-in-out infinite',
    '& svg': { width: '18px', height: '18px' },
    _active: { transform: 'translateY(3px)', boxShadow: '0 1px 0 {colors.suit.redDeep}' },
  },
});
