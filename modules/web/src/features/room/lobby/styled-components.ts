import { styled } from 'styled-system/jsx';

// The lobby over the card table: a column of game cards on each side, the same width so the table
// stays centred between them, and Start at the bottom of the middle. Only the cards and Start take
// clicks: the rest goes through to the table.
export const RoomLobbyRoot = styled('div', {
  base: {
    '--side': '296px',
    position: 'absolute',
    inset: '0',
    zIndex: '2',
    display: 'grid',
    gridTemplateColumns: 'var(--side) minmax(0, 1fr) var(--side)',
    gap: '20px',
    padding: '18px',
    pointerEvents: 'none',
    xl: { '--side': '336px', gap: '28px', padding: '22px' },
  },
  variants: {
    // One column of cards on the right, the table and Start to its left.
    compact: {
      true: { '--side': '300px', gridTemplateColumns: 'minmax(0, 1fr) var(--side)', gap: '10px', padding: '8px', paddingLeft: '66px', xl: { '--side': '320px', gap: '10px', padding: '8px', paddingLeft: '66px' } },
      false: {},
    },
  },
  defaultVariants: { compact: false },
});

export const RoomLobbySide = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    minHeight: '0',
    marginBlock: '-8px',
    paddingBlock: '8px',
    paddingInline: '4px',
    marginInline: '-4px',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    scrollbarColor: '{colors.brass.deep} transparent',
    pointerEvents: 'auto',
    '& > section:nth-child(2)': { animationDelay: '0.08s' },
    '& > section:nth-child(3)': { animationDelay: '0.16s' },
  },
  variants: {
    side: {
      left: { gridColumn: '1', gridRow: '1' },
      right: { gridColumn: '-2 / -1', gridRow: '1' },
    },
  },
});

export const RoomLobbyHint = styled('p', {
  base: { fontSize: '12.5px', lineHeight: '1.4', color: 'print.muted', '@media (max-height: 540px)': { fontSize: '13.5px' } },
});

export const RoomLobbyPlayersList = styled('ul', {
  base: { display: 'grid', gap: '6px' },
});

export const RoomLobbyPlayersItemRoot = styled('li', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minHeight: '52px',
    paddingBlock: '6px',
    paddingLeft: '8px',
    paddingRight: '4px',
    borderRadius: '12px',
    border: '1.5px solid',
    borderColor: 'print.line',
    bg: 'print.paper',
    animation: 'dialogIn 0.3s ease-out',
  },
  variants: {
    me: {
      true: { borderColor: 'suit.blue', bg: 'rgba(43, 106, 214, 0.08)' },
      false: {},
    },
  },
});

export const RoomLobbyPlayersText = styled('span', {
  base: { display: 'grid', flex: '1', minWidth: '0' },
});

export const RoomLobbyPlayersName = styled('span', {
  base: { fontFamily: 'display', fontSize: '15px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomLobbyPlayersNote = styled('span', {
  base: { fontSize: '12px', fontWeight: '600', color: 'print.muted' },
});

// The free seats: an empty slot that seats a bot.
export const RoomLobbyPlayersAdd = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    height: '48px',
    borderRadius: '12px',
    border: '2px dashed',
    borderColor: 'print.soft',
    color: 'print.muted',
    fontFamily: 'display',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease',
    _hover: { borderColor: 'suit.blue', color: 'suit.blueDeep', bg: 'rgba(43, 106, 214, 0.06)' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '& svg': { width: '18px', height: '18px', strokeWidth: '2.5' },
  },
});

export const RoomLobbyPlayersFoot = styled('footer', {
  base: { display: 'grid', gap: '10px', paddingTop: '14px', borderTop: '2px solid', borderColor: 'print.shade' },
});

export const RoomLobbyRulesList = styled('ul', {
  base: { display: 'grid', gap: '4px', marginInline: '-6px' },
});

// A switched-on rule shows in felt green.
export const RoomLobbyRulesItemRoot = styled('li', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'start',
    gap: '2px',
    paddingBlock: '10px',
    paddingLeft: '10px',
    paddingRight: '4px',
    borderRadius: '12px',
    border: '1.5px solid',
    borderColor: 'transparent',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
  },
  variants: {
    on: {
      true: { bg: 'rgba(47, 158, 88, 0.1)', borderColor: 'rgba(47, 158, 88, 0.45)' },
      false: {},
    },
  },
});

export const RoomLobbyRulesHelp = styled('span', {
  base: { display: 'flex', alignItems: 'center', height: '26px' },
});

// Start, under the deck in the middle of the table.
export const RoomLobbyStartRoot = styled('div', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    alignSelf: 'end',
    justifySelf: 'center',
    gap: '10px',
    maxWidth: '420px',
    paddingBottom: '6px',
    textAlign: 'center',
    pointerEvents: 'auto',
    animation: 'fadeIn 0.6s ease-out',
  },
  variants: {
    // At the top of the phone's column: a dark plate on the rail.
    compact: {
      true: {
        alignSelf: 'stretch',
        justifySelf: 'stretch',
        justifyItems: 'stretch',
        flexShrink: '0',
        gap: '8px',
        maxWidth: 'none',
        padding: '10px',
        borderRadius: '14px',
        bg: 'rgba(14, 10, 8, 0.82)',
        boxShadow: 'floating',
        textAlign: 'left',
        '& > p': { fontSize: '13px' },
      },
      false: {},
    },
  },
  defaultVariants: { compact: false },
});

export const RoomLobbyStartHint = styled('p', {
  base: { fontSize: '14px', fontWeight: '500', color: 'fg.default', textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)', textWrap: 'balance' },
});

export const RoomLobbyStartLink = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    paddingInline: '6px',
    borderRadius: '6px',
    color: 'accent.text',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: '4px',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
    cursor: 'pointer',
    _hover: { color: 'print.card', textDecorationStyle: 'solid' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '& svg': { width: '17px', height: '17px', flexShrink: '0' },
  },
});

// "Play with the deck while you wait": in the lamp's colour, until someone has.
export const RoomLobbyStartPrompt = styled('p', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
    paddingInline: '12px',
    paddingBlock: '6px',
    borderRadius: 'full',
    bg: 'rgba(14, 10, 8, 0.7)',
    color: 'accent.text',
    fontSize: '13.5px',
    fontWeight: '600',
    textWrap: 'balance',
    animation: 'fadeIn 0.6s ease-out',
    '& svg': { width: '16px', height: '16px', flexShrink: '0' },
  },
});
