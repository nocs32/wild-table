import { defineKeyframes } from '@pandacss/dev';

export const keyframes = defineKeyframes({
  emojiRise: {
    '0%': { transform: 'translate(-50%, 0) scale(0.5)', opacity: '0' },
    '8%': { transform: 'translate(-50%, -28px) scale(1)', opacity: '1' },
    '70%': { opacity: '1' },
    '100%': { transform: 'translate(-50%, calc(-100cqh + 160px)) scale(1.3)', opacity: '0' },
  },
  emojiPop: {
    '0%': { transform: 'translate(-50%, 0) scale(0.6)', opacity: '0' },
    '20%': { transform: 'translate(-50%, -24px) scale(1)', opacity: '1' },
    '100%': { transform: 'translate(-50%, -24px) scale(1)', opacity: '0' },
  },
  swayGentle: {
    from: { transform: 'translateX(-8px) rotate(-5deg)' },
    to: { transform: 'translateX(8px) rotate(5deg)' },
  },
  swayWide: {
    from: { transform: 'translateX(-18px) rotate(-8deg)' },
    to: { transform: 'translateX(18px) rotate(8deg)' },
  },
  swayWobbly: {
    from: { transform: 'translateX(-10px) rotate(-12deg)' },
    to: { transform: 'translateX(10px) rotate(12deg)' },
  },
  // A count that just changed.
  pop: {
    '0%': { transform: 'scale(1)' },
    '40%': { transform: 'scale(1.3)' },
    '100%': { transform: 'scale(1)' },
  },
  // A card slides up onto the table.
  deal: {
    from: { transform: 'translateY(28px) rotate(-1.5deg)', opacity: '0' },
    to: { transform: 'translateY(0) rotate(0)', opacity: '1' },
  },
  // The settings card slides in from the right edge.
  slideIn: {
    from: { transform: 'translateX(40px)', opacity: '0' },
    to: { transform: 'translateX(0)', opacity: '1' },
  },
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  dialogIn: {
    from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
    to: { opacity: '1', transform: 'translateY(0) scale(1)' },
  },
  // The rule leaflet unfolds onto the table.
  leafletIn: {
    from: { opacity: '0', transform: 'translateY(24px) rotate(-2deg) scale(0.96)' },
    to: { opacity: '1', transform: 'translateY(0) rotate(0) scale(1)' },
  },
  // A ✅ or ❌ stamped next to a card.
  stamp: {
    '0%': { opacity: '0', transform: 'scale(1.8) rotate(-12deg)' },
    '60%': { opacity: '1', transform: 'scale(0.92) rotate(3deg)' },
    '100%': { opacity: '1', transform: 'scale(1) rotate(0)' },
  },
  // A card that can't be played shakes its head (spec §8.2).
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '20%': { transform: 'translateX(-6px) rotate(-3deg)' },
    '40%': { transform: 'translateX(5px) rotate(2deg)' },
    '60%': { transform: 'translateX(-4px) rotate(-1deg)' },
    '80%': { transform: 'translateX(2px)' },
  },
  // Start, ready to press: an arcade button's light.
  glowPulse: {
    '0%, 100%': { boxShadow: '0 5px 0 {colors.action.primaryEdge}, 0 0 0 0 rgba(255, 201, 99, 0)' },
    '50%': { boxShadow: '0 5px 0 {colors.action.primaryEdge}, 0 0 28px 6px rgba(255, 201, 99, 0.45)' },
  },
  // Something asking to be pressed now: the Last card! sign, a "Last card!" tag.
  pulse: {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.07)' },
  },
  // Whose turn it is: their place card breathes lamplight.
  turnGlow: {
    '0%, 100%': { boxShadow: '0 0 0 3px rgba(255, 201, 99, 0.3), 0 0 14px rgba(255, 201, 99, 0.5)' },
    '50%': { boxShadow: '0 0 0 3px rgba(255, 201, 99, 0.55), 0 0 26px rgba(255, 201, 99, 0.9)' },
  },
  // The "NEW!" starburst turning slowly.
  spinSlow: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  // How to play a card (rule book, page 8): a card from the hand to the pile, four ways.
  howDrag: {
    '0%, 12%': { transform: 'translate(0, 0) rotate(-6deg)' },
    '22%': { transform: 'translate(0, -14px) rotate(-6deg) scale(1.08)' },
    '55%': { transform: 'translate(var(--to-x), var(--to-y)) rotate(8deg) scale(1.08)' },
    '62%, 88%': { transform: 'translate(var(--to-x), var(--to-y)) rotate(3deg) scale(1)' },
    '100%': { transform: 'translate(0, 0) rotate(-6deg)', opacity: '0' },
  },
  howThrow: {
    '0%, 18%': { transform: 'translate(0, 0) rotate(-6deg)' },
    '28%': { transform: 'translate(-6px, 10px) rotate(-10deg) scale(1.06)' },
    '42%': { transform: 'translate(var(--to-x), var(--to-y)) rotate(22deg) scale(1.06)' },
    '48%, 88%': { transform: 'translate(var(--to-x), var(--to-y)) rotate(-4deg) scale(1)' },
    '100%': { transform: 'translate(0, 0) rotate(-6deg)', opacity: '0' },
  },
  howClick: {
    '0%, 15%': { transform: 'translate(0, 0) rotate(-6deg)' },
    '22%, 45%': { transform: 'translate(0, -22px) rotate(0deg) scale(1.15)' },
    '62%, 88%': { transform: 'translate(var(--to-x), var(--to-y)) rotate(3deg) scale(1)' },
    '100%': { transform: 'translate(0, 0) rotate(-6deg)', opacity: '0' },
  },
  howDraw: {
    '0%, 20%': { transform: 'translate(0, 0)', opacity: '1' },
    '55%, 88%': { transform: 'translate(var(--to-x), var(--to-y)) rotate(-6deg)', opacity: '1' },
    '100%': { transform: 'translate(var(--to-x), var(--to-y)) rotate(-6deg)', opacity: '0' },
  },
  // The pointer in the how-to loops: a press, then a release.
  howTap: {
    '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
    '50%': { transform: 'scale(0.82)', opacity: '1' },
  },
});
