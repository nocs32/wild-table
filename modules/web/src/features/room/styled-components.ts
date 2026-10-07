import { styled } from 'styled-system/jsx';

export const RoomRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateRows: '48px minmax(0, 1fr) auto',
    height: '100dvh',
    bg: 'chrome.app',
    color: 'fg.default',
  },
});

// The table, with the chat and flying emoji floating over it. Measured, so the chat stays inside.
export const RoomMain = styled('main', {
  base: { position: 'relative', minHeight: '0', overflow: 'hidden', bg: 'felt.edge' },
});

// A plain green felt in a pool of lamplight, standing in for the 3D table (spec §8.1).
export const RoomScroll = styled('div', {
  base: {
    height: '100%',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    bg: 'felt.edge',
    bgImage: 'radial-gradient(ellipse 70% 80% at 50% 38%, {colors.felt.light}, {colors.felt.base} 55%, {colors.felt.edge})',
    bgAttachment: 'local',
  },
});

// Instead of the table, while it opens or when there's none to show.
export const RoomStatusRoot = styled('main', {
  base: { display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: '24px', bg: 'chrome.app', color: 'fg.default' },
});

export const RoomStatusCard = styled('section', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '12px',
    width: '100%',
    maxWidth: '400px',
    padding: '28px',
    borderRadius: '4px',
    bg: 'stationery.card',
    color: 'notebook.ink',
    boxShadow: 'note',
    textAlign: 'center',
    transform: 'rotate(-0.8deg)',
    animation: 'dialogIn 0.25s ease-out',
  },
});

export const RoomStatusLogo = styled('span', {
  base: { display: 'inline-flex', marginBottom: '4px', '& svg': { width: '44px', height: '44px' } },
});

export const RoomStatusTitle = styled('h1', {
  base: { fontSize: '20px', fontWeight: '900', letterSpacing: '-0.01em' },
});

export const RoomStatusText = styled('p', {
  base: { marginBottom: '8px', fontSize: '15px', color: 'notebook.muted', textWrap: 'balance' },
});

export const RoomStatusSpinner = styled('span', {
  base: {
    display: 'inline-flex',
    color: 'accent.default',
    '& svg': { width: '22px', height: '22px', animation: 'spin' },
    _motionReduce: { '& svg': { animation: 'none' } },
  },
});

export const RoomFlightsRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '6', overflow: 'hidden', pointerEvents: 'none', containerType: 'size' },
});

export const RoomFlightsRise = styled('div', {
  base: {
    position: 'absolute',
    bottom: '12px',
    animation: 'emojiRise 3s cubic-bezier(0.2, 0.6, 0.3, 1) forwards',
    willChange: 'transform, opacity',
    _motionReduce: { animation: 'emojiPop 1.6s ease-out forwards' },
  },
  variants: {
    lane: {
      l1: { left: '14%' },
      l2: { left: '23%' },
      l3: { left: '32%' },
      l4: { left: '41%' },
      l5: { left: '50%' },
      l6: { left: '59%' },
      l7: { left: '68%' },
      l8: { left: '77%' },
      l9: { left: '86%' },
    },
  },
});

export const RoomFlightsSway = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'emoji',
    fontSize: '40px',
    lineHeight: '1',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))',
    _motionReduce: { animation: 'none' },
  },
  variants: {
    sway: {
      gentle: { animation: 'swayGentle 1.4s ease-in-out infinite alternate' },
      wide: { animation: 'swayWide 1.1s ease-in-out infinite alternate' },
      wobbly: { animation: 'swayWobbly 0.7s ease-in-out infinite alternate' },
    },
  },
});

export const RoomFlightsName = styled('span', {
  base: { marginTop: '4px', paddingInline: '6px', borderRadius: '4px', bg: 'sand.1', color: 'fg.default', fontFamily: 'body', fontSize: '11px', fontWeight: '700' },
});
