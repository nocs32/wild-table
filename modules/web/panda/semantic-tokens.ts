import { defineSemanticTokens } from '@pandacss/dev';

// Dark only. Names say what a colour is for; values come from tokens.ts.
export const semanticTokens = defineSemanticTokens({
  colors: {
    chrome: {
      app: { value: '{colors.sand.1}' },
      fg: { value: '{colors.sand.11}' },
      fgStrong: { value: '{colors.sand.12}' },
      hover: { value: '{colors.sand.3}' },
      border: { value: '{colors.sand.4}' },
      field: { value: '{colors.sand.2}' },
      fieldHover: { value: '{colors.sand.3}' },
    },
    bg: {
      surface: { value: '{colors.sand.2}' },
      subtle: { value: '{colors.sand.3}' },
      muted: { value: '{colors.sand.4}' },
      hover: { value: 'rgba(255, 251, 237, 0.06)' },
      overlay: { value: 'rgba(0, 0, 0, 0.72)' },
      tooltip: { value: '{colors.sand.12}' },
    },
    fg: {
      default: { value: '{colors.sand.12}' },
      muted: { value: '{colors.sand.11}' },
      subtle: { value: '{colors.sand.10}' },
      onAccent: { value: '#FFFFFF' },
      onTooltip: { value: '{colors.sand.1}' },
    },
    border: {
      subtle: { value: '{colors.sand.4}' },
      default: { value: '{colors.sand.6}' },
      strong: { value: '{colors.sand.7}' },
    },
    action: {
      primary: { value: '{colors.grass.9}' },
      primaryHover: { value: '{colors.grass.10}' },
    },
    accent: {
      default: { value: '{colors.grass.9}' },
      text: { value: '{colors.grass.11}' },
      tint: { value: 'rgba(70, 167, 88, 0.2)' },
      ring: { value: '{colors.grass.10}' },
      glow: { value: 'rgba(83, 179, 101, 0.45)' },
    },
    danger: { value: '{colors.status.red}' },
    success: {
      default: { value: '{colors.status.green}' },
      tint: { value: 'rgba(48, 164, 108, 0.16)' },
      text: { value: '#5BD69B' },
    },
    presence: { online: { value: '{colors.status.green}' } },
  },
  shadows: {
    floating: { value: '0 0 0 1px rgba(255, 251, 237, 0.08), 0 8px 24px rgba(0, 0, 0, 0.6)' },
    dialog: { value: '0 0 0 1px rgba(255, 251, 237, 0.1), 0 24px 48px rgba(0, 0, 0, 0.8)' },
    // A sheet of paper lying on the dark table.
    paper: { value: '0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 18px 40px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.3)' },
    // A sticky note or card lying on the mat, a corner lifting a little.
    note: { value: '0 14px 22px -8px rgba(0, 0, 0, 0.55), 0 3px 6px rgba(0, 0, 0, 0.3)' },
    // A sticker: a white die-cut edge and a shadow.
    sticker: { value: '0 0 0 2px #FFFFFF, 0 3px 6px rgba(0, 0, 0, 0.45)' },
  },
});
