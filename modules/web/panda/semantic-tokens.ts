import { defineSemanticTokens } from '@pandacss/dev';

// Dark only. Names say what a colour is for; values come from tokens.ts.
export const semanticTokens = defineSemanticTokens({
  colors: {
    // The room's own surfaces: wood, brass and lamplit lettering.
    chrome: {
      app: { value: '{colors.room.night}' },
      fg: { value: '#D9C9AC' },
      fgStrong: { value: '{colors.print.card}' },
      hover: { value: 'rgba(255, 226, 170, 0.08)' },
      border: { value: 'rgba(221, 189, 120, 0.18)' },
      field: { value: '{colors.room.dusk}' },
      fieldHover: { value: '{colors.room.shade}' },
    },
    bg: {
      surface: { value: '{colors.room.shade}' },
      subtle: { value: '{colors.room.smoke}' },
      muted: { value: '{colors.room.haze}' },
      hover: { value: 'rgba(255, 226, 170, 0.07)' },
      overlay: { value: 'rgba(8, 5, 3, 0.78)' },
      tooltip: { value: '{colors.print.card}' },
    },
    fg: {
      default: { value: '#F2E5CB' },
      muted: { value: '#C4B193' },
      subtle: { value: '#8F7C63' },
      onAccent: { value: '{colors.print.ink}' },
      onTooltip: { value: '{colors.print.ink}' },
    },
    border: {
      subtle: { value: 'rgba(221, 189, 120, 0.12)' },
      default: { value: 'rgba(221, 189, 120, 0.22)' },
      strong: { value: 'rgba(221, 189, 120, 0.36)' },
    },
    // The main buttons: the yellow of the cards, like an arcade button.
    action: {
      primary: { value: '{colors.suit.yellow}' },
      primaryHover: { value: '#FFC64A' },
      primaryEdge: { value: '{colors.suit.yellowDeep}' },
    },
    accent: {
      default: { value: '{colors.lamp.glow}' },
      text: { value: '#FFD27E' },
      tint: { value: 'rgba(245, 182, 42, 0.16)' },
      // Keyboard focus: neon pink, which shows on the dark room and on card stock alike.
      ring: { value: '{colors.neon.pinkDeep}' },
      glow: { value: 'rgba(255, 201, 99, 0.45)' },
    },
    danger: { value: '{colors.suit.red}' },
    success: {
      default: { value: '{colors.status.green}' },
      tint: { value: 'rgba(48, 164, 108, 0.16)' },
      text: { value: '#5BD69B' },
    },
    presence: { online: { value: '{colors.status.green}' } },
  },
  shadows: {
    floating: { value: '0 0 0 1px rgba(221, 189, 120, 0.16), 0 10px 28px rgba(0, 0, 0, 0.65)' },
    dialog: { value: '0 0 0 1px rgba(221, 189, 120, 0.22), 0 24px 56px rgba(0, 0, 0, 0.8)' },
    // A printed card in the lamplight: a glossy top edge and a soft shadow on the table.
    print: { value: 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 22px 44px -12px rgba(0, 0, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.45)' },
    // A poker chip's thickness.
    chip: { value: '0 2px 0 rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.35)' },
  },
});
