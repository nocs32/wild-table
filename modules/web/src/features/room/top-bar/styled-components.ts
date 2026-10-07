import { styled } from 'styled-system/jsx';

// The back edge of the desk.
export const RoomTopBarRoot = styled('header', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '12px',
    paddingInline: '10px',
    bg: 'desk.edge',
    color: 'chrome.fgStrong',
    md: { gridTemplateColumns: '1fr minmax(0, 460px) 1fr' },
  },
});

export const RoomTopBarStart = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' },
});

// While the connection is down and the table holds your seat.
export const RoomTopBarReconnecting = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '24px',
    paddingInline: '8px',
    borderRadius: 'full',
    bg: 'accent.tint',
    color: 'accent.text',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    '& svg': { width: '12px', height: '12px', animation: 'spin' },
    _motionReduce: { '& svg': { animation: 'none' } },
  },
});

export const RoomTopBarEnd = styled('div', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' },
});

export const RoomTopBarBrand = styled('div', {
  base: {
    display: 'none',
    alignItems: 'center',
    gap: '8px',
    paddingInline: '4px',
    fontSize: '15px',
    fontWeight: '900',
    letterSpacing: '-0.01em',
    color: 'desk.chalk',
    whiteSpace: 'nowrap',
    sm: { display: 'flex' },
    '& svg': { width: '26px', height: '26px', flexShrink: '0', transform: 'rotate(-6deg)' },
  },
});

// The language, on a little round sticker.
export const RoomTopBarLanguage = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    marginInline: '4px',
    borderRadius: 'full',
    bg: 'stationery.backing',
    color: 'notebook.ink',
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '0.04em',
    boxShadow: 'sticker',
    transform: 'rotate(-8deg)',
    cursor: 'pointer',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'rotate(4deg) scale(1.08)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '3px' },
  },
});

// Share sends the link off like a paper plane.
export const RoomTopBarShare = styled('button', {
  base: {
    '--edge': '{colors.grass.7}',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '30px',
    paddingInline: '12px',
    borderRadius: '8px',
    bg: 'action.primary',
    color: 'fg.onAccent',
    fontSize: '13px',
    fontWeight: '900',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 0 var(--edge)',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease, background-color 0.12s ease',
    _hover: { bg: 'action.primaryHover', transform: 'translateY(-1px)', boxShadow: '0 3px 0 var(--edge)', '& svg': { transform: 'translate(2px, -2px) rotate(-8deg)' } },
    _active: { transform: 'translateY(2px)', boxShadow: '0 0 0 var(--edge)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '& svg': { width: '14px', height: '14px', strokeWidth: '2.5', transition: 'transform 0.2s ease' },
  },
});

export const RoomTopBarShareLabel = styled('span', {
  base: { display: 'none', sm: { display: 'inline' } },
});

// The table's link on a ticket stub: notches cut in both ends, and a torn-off part to copy it.
export const RoomTopBarLinkRoot = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    height: '30px',
    paddingInline: '14px',
    borderRadius: '3px',
    bg: 'stationery.card',
    color: 'notebook.ink',
    fontSize: '13px',
    fontWeight: '700',
    maskImage: 'radial-gradient(circle at 0 50%, transparent 6px, black 6.5px), radial-gradient(circle at 100% 50%, transparent 6px, black 6.5px)',
    maskSize: '51% 100%',
    maskPosition: 'left, right',
    maskRepeat: 'no-repeat',
    transform: 'rotate(-0.8deg)',
    cursor: 'pointer',
    transition: 'transform 0.12s ease, background-color 0.12s ease',
    _hover: { bg: 'white', transform: 'rotate(0deg)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '14px', height: '14px', flexShrink: '0' },
  },
});

export const RoomTopBarLinkText = styled('span', {
  base: {
    flex: '1',
    minWidth: '0',
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export const RoomTopBarLinkHint = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: '4px',
    flexShrink: '0',
    paddingLeft: '10px',
    borderLeft: '2px dashed',
    borderColor: 'rgba(38, 37, 31, 0.28)',
    fontSize: '12px',
    fontWeight: '900',
    color: 'stationery.stampBlue',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    '& svg': { width: '13px', height: '13px' },
  },
});

// Phones show just the icon, so the link itself has room.
export const RoomTopBarLinkHintLabel = styled('span', {
  base: { display: 'none', sm: { display: 'inline' } },
});

// The demo table's buttons, next to the brand. Desktop only: it's a tool for trying the game alone.
export const RoomTopBarDemoRoot = styled('div', {
  base: {
    display: 'none',
    alignItems: 'center',
    gap: '2px',
    marginLeft: '8px',
    paddingLeft: '4px',
    paddingRight: '2px',
    borderRadius: '8px',
    border: '1px dashed',
    borderColor: 'chrome.border',
    md: { display: 'flex' },
  },
});

export const RoomTopBarDemoLabel = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    paddingInline: '6px',
    fontSize: '11px',
    fontWeight: '900',
    color: 'chrome.fg',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    '& svg': { width: '13px', height: '13px' },
  },
});

export const RoomTopBarDemoButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    color: 'chrome.fg',
    cursor: 'pointer',
    _hover: { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '15px', height: '15px' },
  },
});
