import { styled } from 'styled-system/jsx';

// The rule book's examples are made of these: real cards, ✅ and ❌ marks, the pile on its felt
// mat, and the "Try it" hand.

// A card's picture; the art has its own rounded corners and border.
export const RoomRuleBookCardRoot = styled('span', {
  base: { position: 'relative', display: 'inline-grid', flexShrink: '0', filter: 'drop-shadow(0 3px 3px rgba(34, 23, 14, 0.35))' },
  variants: {
    size: {
      sm: { width: '52px' },
      md: { width: '72px' },
      lg: { width: '92px' },
    },
    shake: {
      true: { animation: 'shake 0.45s ease-in-out' },
      false: {},
    },
  },
  defaultVariants: { size: 'md', shake: false },
});

export const RoomRuleBookCardImage = styled('img', {
  base: { width: '100%', aspectRatio: '5 / 7', borderRadius: '8%', bg: 'print.shade' },
});

// A ✅ or ❌ stamped on a card's corner.
export const RoomRuleBookMark = styled('span', {
  base: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    display: 'grid',
    placeItems: 'center',
    width: '26px',
    height: '26px',
    borderRadius: 'full',
    border: '2px solid',
    borderColor: 'print.ink',
    color: 'print.card',
    animation: 'stamp 0.35s ease-out backwards',
    '& svg': { width: '15px', height: '15px', strokeWidth: '3.5' },
  },
  variants: {
    fits: {
      true: { bg: 'suit.green' },
      false: { bg: 'suit.red' },
    },
  },
});

// A card with its mark and, under it, why.
export const RoomRuleBookMarkedRoot = styled('figure', {
  base: { display: 'grid', justifyItems: 'center', alignContent: 'start', gap: '6px', width: '88px' },
});

export const RoomRuleBookCaption = styled('figcaption', {
  base: { fontSize: '12px', fontWeight: '600', lineHeight: '1.3', textAlign: 'center', color: 'print.muted', _firstLetter: { textTransform: 'uppercase' } },
});

// A worked example: the pile on one side, a hand on the other.
export const RoomRuleBookExampleRoot = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: '18px 24px',
    padding: '16px',
    borderRadius: '14px',
    border: '2px solid',
    borderColor: 'print.line',
    bg: 'print.card',
  },
});

export const RoomRuleBookGroup = styled('div', {
  base: { display: 'grid', gap: '8px', alignContent: 'start' },
});

export const RoomRuleBookGroupLabel = styled('span', {
  base: { fontFamily: 'display', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'print.muted' },
});

export const RoomRuleBookRow = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '10px' },
});

// The pile in an example: a felt-green mat under the top card.
export const RoomRuleBookPile = styled('div', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '112px',
    minHeight: '136px',
    borderRadius: '12px',
    bg: 'felt.base',
    bgImage: 'radial-gradient(ellipse at 50% 40%, {colors.felt.light}, {colors.felt.base} 70%)',
    boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.45)',
    transition: 'box-shadow 0.15s ease',
  },
  variants: {
    target: {
      true: { boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.45), 0 0 0 3px {colors.suit.yellow}' },
      false: {},
    },
  },
  defaultVariants: { target: false },
});

// "Try it": the line that says what the last card did.
export const RoomRuleBookTryMessage = styled('p', {
  base: { minHeight: '44px', paddingInline: '12px', paddingBlock: '10px', borderRadius: '10px', bg: 'print.shade', fontSize: '14.5px', fontWeight: '600', lineHeight: '1.4' },
});

// A card in the "Try it" hand: it lifts as you point at it.
export const RoomRuleBookTryCard = styled('button', {
  base: {
    display: 'inline-grid',
    borderRadius: '8px',
    cursor: 'grab',
    transition: 'transform 0.14s cubic-bezier(0.3, 1.4, 0.5, 1)',
    _hover: { transform: 'translateY(-8px)' },
    _active: { cursor: 'grabbing' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '3px' },
  },
});

// "Try it" (spec §9.1): a dashed yellow box you can play in.
export const RoomRuleBookTryRoot = styled('section', {
  base: { display: 'grid', gap: '12px', padding: '16px', borderRadius: '14px', border: '2px dashed', borderColor: 'suit.yellowDeep', bg: 'rgba(245, 182, 42, 0.08)' },
});

export const RoomRuleBookTryTitle = styled('h4', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'display', fontSize: '17px', fontWeight: '800', '& svg': { width: '18px', height: '18px', color: 'suit.yellowDeep' } },
});

export const RoomRuleBookTryFoot = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', '& > p': { flex: '1', minWidth: '220px' } },
});

// A screenshot as a Polaroid: a white frame with a deeper strip at the bottom for the caption.
export const RoomRuleBookShotRoot = styled('figure', {
  base: {
    display: 'grid',
    gap: '10px',
    justifySelf: 'start',
    maxWidth: '520px',
    '@media (max-height: 540px)': { maxWidth: '380px' },
    paddingInline: '12px',
    paddingTop: '12px',
    paddingBottom: '14px',
    bg: 'white',
    boxShadow: '0 1px 2px rgba(34, 23, 14, 0.2), 0 10px 22px -8px rgba(34, 23, 14, 0.45)',
  },
});

export const RoomRuleBookShotImage = styled('img', {
  base: { display: 'block', width: '100%', height: 'auto', bg: 'room.night' },
});

export const RoomRuleBookShotCaption = styled('figcaption', {
  base: { fontSize: '13.5px', fontWeight: '500', lineHeight: '1.4', color: 'print.muted', textWrap: 'pretty' },
});
