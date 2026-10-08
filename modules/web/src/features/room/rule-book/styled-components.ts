import { Dialog } from '@ark-ui/react/dialog';
import { styled } from 'styled-system/jsx';

// The rule book (spec §9.1): the game's own printed leaflet, straight out of a 90s game box. Glossy
// cream paper with bold type, a printed red header with a NEW! starburst and a staple, index tabs
// down the side, and a coffee ring someone left on it. On a phone it fills the screen.

export const RoomRuleBookBackdrop = styled(Dialog.Backdrop, {
  base: { position: 'fixed', inset: '0', zIndex: '50', bg: 'bg.overlay', backdropFilter: 'blur(2px)', '&[data-state=open]': { animation: 'fadeIn 0.2s ease-out' } },
});

export const RoomRuleBookPositioner = styled(Dialog.Positioner, {
  base: { position: 'fixed', inset: '0', zIndex: '51', display: 'grid', placeItems: 'center', padding: '0', '@media (min-width: 640px) and (min-height: 541px)': { padding: '20px' } },
});

export const RoomRuleBookContent = styled(Dialog.Content, {
  base: {
    position: 'relative',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    bg: 'print.paper',
    bgImage: 'radial-gradient(circle at 92% 88%, transparent 46px, rgba(122, 74, 32, 0.14) 47px 52px, transparent 54px), linear-gradient(90deg, transparent calc(50% - 1px), rgba(34, 23, 14, 0.03) 50%, transparent calc(50% + 4px))',
    color: 'print.ink',
    outline: 'none',
    '&[data-state=open]': { animation: 'leafletIn 0.28s cubic-bezier(0.2, 0.8, 0.3, 1.05)' },
    // On a bigger screen it lies over the table; on a phone it fills the screen.
    '@media (min-width: 640px) and (min-height: 541px)': { maxWidth: '980px', height: 'min(720px, 100%)', borderRadius: '10px', border: '3px solid', borderColor: 'print.ink', boxShadow: '0 30px 70px rgba(0, 0, 0, 0.8)' },
  },
});

// The printed header band across the top.
export const RoomRuleBookHead = styled('header', {
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minHeight: '64px',
    paddingInline: '18px',
    '@media (max-height: 540px)': { minHeight: '50px', '& > svg': { width: '28px', height: '28px' } },
    borderBottom: '3px solid',
    borderColor: 'print.ink',
    bg: 'suit.red',
    bgImage: 'radial-gradient(circle, {colors.suit.redDeep} 0 1.8px, transparent 2.3px), linear-gradient(160deg, rgba(255, 255, 255, 0.25), transparent 45%)',
    bgSize: '9px 9px, 100% 100%',
    '& > svg': { width: '36px', height: '36px', flexShrink: '0', filter: 'drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.35))' },
  },
});

// The staple holding the fold, top left.
export const RoomRuleBookStaple = styled('span', {
  base: { position: 'absolute', top: '6px', left: '10px', width: '22px', height: '4px', borderRadius: '2px', bgImage: 'linear-gradient(#F4F4F0, #9C9C97)', boxShadow: '0 1px 1px rgba(0, 0, 0, 0.5)' },
});

export const RoomRuleBookTitle = styled(Dialog.Title, {
  base: {
    flex: '1',
    minWidth: '0',
    fontFamily: 'display',
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    color: 'print.card',
    WebkitTextStroke: '6px {colors.print.ink}',
    paintOrder: 'stroke fill',
    textShadow: '4px 4px 0 {colors.suit.redDeep}',
    '@media (max-height: 540px)': { fontSize: '22px' },
  },
});

// "NEW!": a pink starburst sticker.
export const RoomRuleBookNew = styled('span', {
  base: {
    display: 'none',
    placeItems: 'center',
    width: '64px',
    height: '64px',
    flexShrink: '0',
    bg: 'neon.pink',
    clipPath: 'polygon(50% 0%, 59% 15%, 75% 7%, 76% 25%, 93% 25%, 85% 41%, 100% 50%, 85% 59%, 93% 75%, 76% 75%, 75% 93%, 59% 85%, 50% 100%, 41% 85%, 25% 93%, 24% 75%, 7% 75%, 15% 59%, 0% 50%, 15% 41%, 7% 25%, 24% 25%, 25% 7%, 41% 15%)',
    fontFamily: 'display',
    fontSize: '13px',
    fontWeight: '800',
    textTransform: 'uppercase',
    color: 'print.card',
    WebkitTextStroke: '3px {colors.print.ink}',
    paintOrder: 'stroke fill',
    sm: { display: 'grid' },
    '@media (max-height: 540px)': { width: '48px', height: '48px', fontSize: '11px' },
  },
});

export const RoomRuleBookClose = styled(Dialog.CloseTrigger, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '38px',
    height: '38px',
    borderRadius: 'full',
    border: '2px solid',
    borderColor: 'print.ink',
    bg: 'print.card',
    color: 'print.ink',
    boxShadow: '0 3px 0 {colors.print.ink}',
    cursor: 'pointer',
    _hover: { bg: 'white' },
    _active: { transform: 'translateY(2px)', boxShadow: '0 1px 0 {colors.print.ink}' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '& svg': { width: '20px', height: '20px', strokeWidth: '2.5' },
  },
});

// Tabs down the side, numbers only on a narrow screen, and the page beside them.
export const RoomRuleBookBody = styled('div', {
  base: { display: 'grid', gridTemplateColumns: '58px minmax(0, 1fr)', minHeight: '0', md: { gridTemplateColumns: '210px minmax(0, 1fr)' } },
});

// The index tabs down the side.
export const RoomRuleBookTabsRoot = styled('nav', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflowY: 'auto',
    paddingBlock: '10px',
    paddingInline: '8px',
    borderRight: '2px solid',
    borderColor: 'print.line',
    bg: 'print.shade',
    scrollbarWidth: 'none',
    md: { paddingBlock: '16px', paddingInline: '12px' },
  },
});

export const RoomRuleBookTab = styled('button', {
  base: {
    '--tab': '{colors.suit.red}',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: '0',
    height: '40px',
    paddingInline: '8px',
    paddingRight: '12px',
    borderRadius: '10px',
    border: '2px solid transparent',
    fontFamily: 'display',
    fontSize: '14px',
    fontWeight: '700',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    color: 'print.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _hover: { bg: 'rgba(34, 23, 14, 0.06)', color: 'print.ink' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '&[aria-current=page]': { bg: 'print.card', borderColor: 'print.ink', color: 'print.ink', boxShadow: '0 3px 0 {colors.print.ink}' },
    '&:nth-child(4n+2)': { '--tab': '{colors.suit.yellowDeep}' },
    '&:nth-child(4n+3)': { '--tab': '{colors.suit.green}' },
    '&:nth-child(4n+4)': { '--tab': '{colors.suit.blue}' },
  },
});

// The page number on a chip in the tab's colour.
export const RoomRuleBookTabNumber = styled('span', {
  base: { display: 'grid', placeItems: 'center', flexShrink: '0', width: '24px', height: '24px', borderRadius: 'full', bg: 'var(--tab)', border: '2px solid', borderColor: 'print.ink', color: 'print.card', fontSize: '12px', fontWeight: '800' },
});

export const RoomRuleBookTabLabel = styled('span', {
  base: { display: 'none', md: { display: 'inline' } },
});

// The leaflet's one long page.
export const RoomRuleBookScroll = styled('div', {
  base: { display: 'grid', alignContent: 'start', minHeight: '0', overflowY: 'auto', overscrollBehavior: 'contain', paddingInline: '18px', paddingTop: '16px', paddingBottom: '40vh', md: { paddingInline: '34px', paddingTop: '26px' } },
});

// A section, with a printed rule in the four colours between it and the next.
export const RoomRuleBookSectionRoot = styled('section', {
  base: {
    display: 'grid',
    alignContent: 'start',
    gap: '18px',
    paddingBottom: '34px',
    marginBottom: '30px',
    scrollMarginTop: '12px',
    bgImage: 'linear-gradient(90deg, {colors.suit.red} 0 25%, {colors.suit.yellow} 25% 50%, {colors.suit.green} 50% 75%, {colors.suit.blue} 75%)',
    bgSize: '100% 4px',
    bgPosition: 'bottom',
    bgRepeat: 'no-repeat',
    _last: { bgImage: 'none', marginBottom: '0' },
  },
});

// The section's number on a chip.
export const RoomRuleBookHeadingNumber = styled('span', {
  base: { display: 'inline-grid', placeItems: 'center', width: '32px', height: '32px', marginRight: '10px', borderRadius: 'full', border: '2px solid', borderColor: 'print.ink', bg: 'suit.red', color: 'print.card', fontSize: '15px', verticalAlign: '3px' },
});

export const RoomRuleBookHeading = styled('h3', {
  base: { fontFamily: 'display', fontSize: '26px', fontWeight: '800', lineHeight: '1.1', bgImage: 'linear-gradient(transparent 62%, rgba(245, 182, 42, 0.55) 62% 92%, transparent 92%)', justifySelf: 'start' },
});

export const RoomRuleBookLead = styled('p', {
  base: { fontSize: '17px', fontWeight: '600', lineHeight: '1.4', maxWidth: '60ch', textWrap: 'pretty' },
});

export const RoomRuleBookText = styled('p', {
  base: { fontSize: '15px', lineHeight: '1.5', maxWidth: '62ch', color: 'print.ink', textWrap: 'pretty' },
  variants: {
    tone: {
      plain: {},
      muted: { color: 'print.muted' },
      note: { paddingInline: '12px', paddingBlock: '10px', borderRadius: '10px', bg: 'print.shade', borderLeft: '4px solid', borderColor: 'suit.yellowDeep' },
    },
  },
  defaultVariants: { tone: 'plain' },
});
