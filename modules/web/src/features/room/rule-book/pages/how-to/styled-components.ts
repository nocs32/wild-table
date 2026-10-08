import { styled } from 'styled-system/jsx';

// Page 8: four little looping tables showing how a card gets played (spec §9.1).

export const RoomRuleBookPageHowToGrid = styled('ul', {
  base: { display: 'grid', gap: '14px', sm: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } },
});

export const RoomRuleBookPageHowToDemoRoot = styled('li', {
  base: { display: 'grid', gap: '10px', alignContent: 'start', padding: '12px', borderRadius: '14px', border: '2px solid', borderColor: 'print.line', bg: 'print.card' },
});

export const RoomRuleBookPageHowToTitle = styled('h4', {
  base: { fontFamily: 'display', fontSize: '17px', fontWeight: '800' },
});

// A patch of felt, with a hand at the bottom left and the pile (or the deck) to its right.
export const RoomRuleBookPageHowToSceneRoot = styled('div', {
  base: {
    position: 'relative',
    height: '132px',
    borderRadius: '10px',
    overflow: 'hidden',
    bg: 'felt.base',
    bgImage: 'radial-gradient(ellipse at 60% 40%, {colors.felt.light}, {colors.felt.base} 75%)',
    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.45)',
  },
});

export const RoomRuleBookPageHowToSlot = styled('span', {
  base: { position: 'absolute', width: '44px', filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.4))', '& img': { display: 'block', width: '100%', borderRadius: '8%' } },
  variants: {
    at: {
      handA: { left: '18px', top: '62px', transform: 'rotate(-12deg)' },
      handB: { left: '44px', top: '58px' },
      pile: { left: '150px', top: '22px' },
    },
  },
});

// The card that gets played, over and over. --to-x and --to-y are where the pile is from it.
export const RoomRuleBookPageHowToMover = styled('span', {
  base: {
    '--to-x': '80px',
    '--to-y': '-36px',
    position: 'absolute',
    left: '70px',
    top: '58px',
    width: '44px',
    filter: 'drop-shadow(0 4px 4px rgba(0, 0, 0, 0.45))',
    animationDuration: '2.6s',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    animationIterationCount: 'infinite',
    '& img': { display: 'block', width: '100%', borderRadius: '8%' },
    _motionReduce: { animation: 'none' },
  },
  variants: {
    kind: {
      drag: { animationName: 'howDrag' },
      throw: { animationName: 'howThrow' },
      click: { animationName: 'howClick' },
      // From the deck into the hand.
      draw: { left: '150px', top: '22px', '--to-x': '-80px', '--to-y': '36px', animationName: 'howDraw' },
    },
  },
});

// The pointer: a fingertip pressing and lifting.
export const RoomRuleBookPageHowToPointer = styled('span', {
  base: {
    position: 'absolute',
    left: '50%',
    top: '55%',
    width: '18px',
    height: '18px',
    marginLeft: '-9px',
    borderRadius: 'full',
    border: '2px solid',
    borderColor: 'print.card',
    bg: 'rgba(255, 79, 168, 0.55)',
    animation: 'howTap 1.3s ease-in-out infinite',
    _motionReduce: { animation: 'none' },
  },
});
