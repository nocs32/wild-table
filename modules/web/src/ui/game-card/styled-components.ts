import { styled } from 'styled-system/jsx';

// A lobby panel as a big game card: cream card stock, an ink edge, and a printed header.
export const GameCardRoot = styled('section', {
  base: {
    '--suit': '{colors.suit.red}',
    '--suit-deep': '{colors.suit.redDeep}',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: '0',
    padding: '7px',
    borderRadius: '18px',
    border: '2px solid',
    borderColor: 'print.ink',
    bg: 'print.card',
    color: 'print.ink',
    boxShadow: 'print',
    animation: 'deal 0.45s cubic-bezier(0.2, 0.8, 0.3, 1.1) backwards',
    _motionReduce: { animation: 'none' },
  },
  variants: {
    suit: {
      red: { '--suit': '{colors.suit.red}', '--suit-deep': '{colors.suit.redDeep}' },
      yellow: { '--suit': '{colors.suit.yellow}', '--suit-deep': '{colors.suit.yellowDeep}' },
      green: { '--suit': '{colors.suit.green}', '--suit-deep': '{colors.suit.greenDeep}' },
      blue: { '--suit': '{colors.suit.blue}', '--suit-deep': '{colors.suit.blueDeep}' },
    },
  },
});

// The printed header: the colour with a halftone fading in towards the corner, and a gloss.
export const GameCardHeadRoot = styled('header', {
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: '0',
    minHeight: '58px',
    '@media (max-height: 540px)': { minHeight: '46px', paddingBlock: '6px', gap: '9px', '& h2': { fontSize: '17px' }, '& svg': { fontSize: '26px' } },
    paddingBlock: '9px',
    paddingInline: '12px',
    borderRadius: '12px',
    border: '2px solid',
    borderColor: 'print.ink',
    bg: 'var(--suit)',
    overflow: 'hidden',
    _before: {
      content: '""',
      position: 'absolute',
      inset: '0',
      bgImage: 'radial-gradient(circle, var(--suit-deep) 0 1.7px, transparent 2.2px)',
      bgSize: '8px 8px',
      maskImage: 'linear-gradient(110deg, transparent 35%, black 100%)',
    },
    _after: { content: '""', position: 'absolute', inset: '0', bgImage: 'linear-gradient(160deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05) 42%, transparent 43%)' },
  },
});

export const GameCardSymbol = styled('span', {
  base: {
    position: 'relative',
    zIndex: '1',
    display: 'inline-flex',
    flexShrink: '0',
    fontSize: '34px',
    color: 'print.card',
    filter: 'drop-shadow(2px 2px 0 var(--suit-deep))',
    '& svg path': { stroke: 'print.ink', strokeWidth: '10px', paintOrder: 'stroke' },
    '& svg path[fill=none]': { strokeWidth: '6px' },
  },
});

export const GameCardTitles = styled('div', {
  base: { position: 'relative', zIndex: '1', display: 'grid', minWidth: '0' },
});

// Lettered like the cards' numbers: cream, an ink outline and a hard shadow.
export const GameCardTitle = styled('h2', {
  base: {
    fontFamily: 'display',
    fontSize: '21px',
    fontWeight: '800',
    lineHeight: '1.15',
    letterSpacing: '0.01em',
    color: 'print.card',
    WebkitTextStroke: '5px {colors.print.ink}',
    paintOrder: 'stroke fill',
    textShadow: '3px 3px 0 var(--suit-deep)',
  },
});

export const GameCardSubtitle = styled('p', {
  base: { fontSize: '12.5px', fontWeight: '600', lineHeight: '1.3', color: 'print.card', textShadow: '0 1px 1px rgba(0, 0, 0, 0.45)' },
});

export const GameCardBody = styled('div', {
  base: { display: 'grid', alignContent: 'start', gap: '16px', minHeight: '0', overflowY: 'auto', paddingInline: '9px', paddingTop: '14px', paddingBottom: '8px' },
});
