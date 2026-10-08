import { styled } from 'styled-system/jsx';

// The pages' own pieces: numbered steps, boxes side by side, the special cards, the scores, the
// house rules and the desk bell, all on the leaflet's cream paper.

export const RoomRuleBookSteps = styled('ol', {
  base: { display: 'grid', gap: '10px', maxWidth: '62ch' },
});

export const RoomRuleBookStep = styled('li', {
  base: { display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr)', alignItems: 'start', gap: '12px', fontSize: '15px', lineHeight: '1.45' },
});

// A step's number on a chip in the card colours.
export const RoomRuleBookStepNumber = styled('span', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '28px',
    height: '28px',
    borderRadius: 'full',
    border: '2px solid',
    borderColor: 'print.ink',
    bg: 'suit.red',
    color: 'print.card',
    fontFamily: 'display',
    fontSize: '13px',
    fontWeight: '800',
    'li:nth-child(4n+2) > &': { bg: 'suit.yellowDeep' },
    'li:nth-child(4n+3) > &': { bg: 'suit.green' },
    'li:nth-child(4n+4) > &': { bg: 'suit.blue' },
  },
});

// Two boxes side by side: fair and bluff, safe and caught, take and challenge.
export const RoomRuleBookPair = styled('div', {
  base: { display: 'grid', gap: '14px', lg: { gridTemplateColumns: '1fr 1fr' } },
});

export const RoomRuleBookBox = styled('section', {
  base: { display: 'grid', alignContent: 'start', gap: '10px', padding: '14px', borderRadius: '14px', border: '2px solid', bg: 'print.card' },
  variants: {
    tone: {
      good: { borderColor: 'suit.green' },
      bad: { borderColor: 'suit.red' },
      plain: { borderColor: 'print.line' },
    },
  },
  defaultVariants: { tone: 'plain' },
});

export const RoomRuleBookBoxTitle = styled('h4', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'display', fontSize: '17px', fontWeight: '800', '& svg': { width: '18px', height: '18px', strokeWidth: '3' } },
  variants: {
    tone: {
      good: { color: 'suit.greenDeep' },
      bad: { color: 'suit.redDeep' },
      plain: {},
    },
  },
  defaultVariants: { tone: 'plain' },
});

// Page 3: each special card with its name, what it does and an example.
export const RoomRuleBookSpecial = styled('li', {
  base: { display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', alignItems: 'center', gap: '16px', paddingBlock: '10px', borderBottom: '2px dotted', borderColor: 'print.line', _last: { borderBottom: 'none' } },
});

export const RoomRuleBookSpecialText = styled('div', {
  base: { display: 'grid', gap: '3px' },
});

export const RoomRuleBookSpecialName = styled('h4', {
  base: { fontFamily: 'display', fontSize: '17px', fontWeight: '800' },
});

export const RoomRuleBookList = styled('ul', {
  base: { display: 'grid' },
});

// Page 6: a hand left over, its cards' points, and its total.
export const RoomRuleBookScoreRow = styled('li', {
  base: { display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr) auto', alignItems: 'center', gap: '14px', paddingBlock: '10px', borderBottom: '2px dotted', borderColor: 'print.line' },
});

export const RoomRuleBookScoreName = styled('span', {
  base: { fontFamily: 'display', fontSize: '15px', fontWeight: '800' },
});

export const RoomRuleBookPoints = styled('span', {
  base: { display: 'grid', justifyItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: 'print.muted', fontVariantNumeric: 'tabular-nums' },
});

export const RoomRuleBookTotal = styled('strong', {
  base: { fontFamily: 'display', fontSize: '18px', fontWeight: '800', color: 'suit.redDeep', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
});

// Page 6's sum: a printed ribbon.
export const RoomRuleBookSum = styled('p', {
  base: { justifySelf: 'start', paddingInline: '14px', paddingBlock: '8px', borderRadius: '10px', border: '2px solid', borderColor: 'print.ink', bg: 'suit.yellow', fontFamily: 'display', fontSize: '17px', fontWeight: '800', boxShadow: '0 3px 0 {colors.print.ink}' },
});

// Page 7: a house rule, marked when it's on at this table, and lit when the book opened for it.
export const RoomRuleBookRule = styled('section', {
  base: { display: 'grid', gap: '10px', padding: '14px', borderRadius: '14px', border: '2px solid', borderColor: 'print.line', bg: 'print.card', scrollMarginTop: '16px', transition: 'box-shadow 0.3s ease' },
  variants: {
    on: {
      true: { borderColor: 'suit.green' },
      false: {},
    },
    highlighted: {
      true: { boxShadow: '0 0 0 4px {colors.suit.yellow}' },
      false: {},
    },
  },
});

export const RoomRuleBookRuleHead = styled('header', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' },
});

export const RoomRuleBookBadge = styled('span', {
  base: { display: 'inline-flex', alignItems: 'center', gap: '5px', paddingInline: '9px', height: '24px', borderRadius: 'full', bg: 'suit.green', color: 'print.card', fontSize: '12px', fontWeight: '700', '& svg': { width: '13px', height: '13px', strokeWidth: '3' } },
});

// Page 5: the desk bell, brass on a dark base.
export const RoomRuleBookBell = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '18px', padding: '16px', borderRadius: '14px', bg: 'felt.base', bgImage: 'radial-gradient(ellipse at 30% 40%, {colors.felt.light}, {colors.felt.base} 70%)' },
});

export const RoomRuleBookBellShape = styled('span', {
  base: {
    position: 'relative',
    width: '92px',
    height: '70px',
    flexShrink: '0',
    _before: { content: '""', position: 'absolute', left: '8px', right: '8px', top: '14px', height: '46px', borderRadius: '46px 46px 4px 4px', bgImage: 'radial-gradient(circle at 35% 30%, {colors.brass.shine}, {colors.brass.base} 45%, {colors.brass.deep})', boxShadow: '0 2px 0 rgba(0, 0, 0, 0.4)' },
    _after: { content: '""', position: 'absolute', left: '0', right: '0', bottom: '0', height: '12px', borderRadius: '4px', bg: 'wood.dark', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.5)' },
  },
});

export const RoomRuleBookBellKnob = styled('span', {
  base: { position: 'absolute', zIndex: '1', top: '4px', left: '50%', width: '14px', height: '14px', marginLeft: '-7px', borderRadius: 'full', bg: 'brass.light', boxShadow: 'inset 0 -2px 0 {colors.brass.deep}' },
});

export const RoomRuleBookBellLabel = styled('span', {
  base: { fontFamily: 'display', fontSize: '24px', fontWeight: '800', color: 'print.card', WebkitTextStroke: '5px {colors.print.ink}', paintOrder: 'stroke fill', textShadow: '3px 3px 0 {colors.suit.redDeep}' },
});
