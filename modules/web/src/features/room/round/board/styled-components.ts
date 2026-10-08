import { styled } from 'styled-system/jsx';

// Between rounds and at the podium: a game card in the middle of the table, scrolling inside when
// a phone is short on height.
export const RoomRoundBoardRoot = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: 'min(500px, 100%)',
    minHeight: '0',
    marginBlock: 'auto',
    paddingBottom: '12px',
    pointerEvents: 'auto',
    '& > section': { minHeight: '0', maxHeight: '100%' },
  },
});

export const RoomRoundBoardBody = styled('div', {
  base: { display: 'grid', gap: '12px', minHeight: '0', overflowY: 'auto', overscrollBehavior: 'contain', '@media (max-height: 540px)': { gap: '8px' } },
});

export const RoomRoundBoardPoints = styled('p', {
  base: { fontFamily: 'display', fontWeight: '900', fontSize: '28px', lineHeight: '1', color: 'suit.green', textAlign: 'center', animation: 'stamp 0.5s ease-out', '@media (max-height: 540px)': { fontSize: '22px' } },
});

export const RoomRoundBoardNote = styled('p', {
  base: { fontSize: '13px', color: 'print.muted', textAlign: 'center' },
});

export const RoomRoundBoardList = styled('ul', {
  base: { display: 'grid', gap: '6px' },
});

// A seat in the round's scores: chip, name, what was left in their hand, and their total.
export const RoomRoundBoardOverRowRoot = styled('li', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '10px',
    paddingBlock: '6px',
    paddingInline: '8px',
    borderRadius: '12px',
    border: '1.5px solid',
    borderColor: 'print.line',
    bg: 'print.paper',
  },
  variants: {
    winner: { true: { borderColor: 'suit.green', bg: 'rgba(47, 158, 88, 0.1)' }, false: {} },
  },
  defaultVariants: { winner: false },
});

export const RoomRoundBoardOverRowText = styled('div', {
  base: { display: 'grid', gap: '3px', minWidth: '0' },
});

export const RoomRoundBoardName = styled('span', {
  base: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'display', fontWeight: '800', fontSize: '14px' },
});

export const RoomRoundBoardOverRowHand = styled('span', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px', fontSize: '12px', color: 'print.muted', '& img': { width: '22px', height: '31px', borderRadius: '3px' } },
});

export const RoomRoundBoardScore = styled('span', {
  base: { fontFamily: 'display', fontWeight: '900', fontSize: '16px', fontVariantNumeric: 'tabular-nums' },
});

export const RoomRoundBoardFoot = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '10px' },
});

// The podium's three steps: second, first, third, the winner's the tallest.
export const RoomRoundBoardPodiumSteps = styled('ol', {
  base: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', paddingTop: '6px' },
});

export const RoomRoundBoardPodiumStep = styled('li', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    width: '110px',
    minWidth: '0',
    animation: 'deal 0.5s cubic-bezier(0.2, 0.8, 0.3, 1.1) backwards',
  },
});

export const RoomRoundBoardPodiumBlock = styled('div', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '100%',
    borderRadius: '10px 10px 4px 4px',
    border: '2px solid',
    borderColor: 'print.ink',
    fontFamily: 'display',
    fontWeight: '900',
    fontSize: '20px',
    color: 'print.card',
    textShadow: '0 1px 1px rgba(0, 0, 0, 0.4)',
  },
  variants: {
    place: {
      1: { height: '78px', bg: 'suit.yellow', color: 'print.ink', textShadow: 'none', '@media (max-height: 540px)': { height: '54px' } },
      2: { height: '56px', bg: 'suit.blue', '@media (max-height: 540px)': { height: '40px' } },
      3: { height: '42px', bg: 'suit.red', '@media (max-height: 540px)': { height: '30px' } },
    },
  },
});
