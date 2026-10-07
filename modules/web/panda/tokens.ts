import { defineTokens } from '@pandacss/dev';

// The siblings' palette (dark): Radix "sand" greys, with Wild Table's own accent, Radix "grass" (the
// card table's felt), and the felt itself. The paper, desk and stationery colours are Telephone
// Table's, kept for the chat, the dock and the lobby's cards until the rec room's style replaces
// them (spec §8.1).
export const tokens = defineTokens({
  fonts: {
    body: { value: 'Lato, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
    mono: { value: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' },
    emoji: { value: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' },
  },
  colors: {
    sand: {
      1: { value: '#111110' },
      2: { value: '#191918' },
      3: { value: '#222221' },
      4: { value: '#2A2A28' },
      5: { value: '#31312E' },
      6: { value: '#3B3A37' },
      7: { value: '#494844' },
      8: { value: '#62605B' },
      9: { value: '#6F6D66' },
      10: { value: '#7C7B74' },
      11: { value: '#B5B3AD' },
      12: { value: '#EEEEEC' },
    },
    grass: {
      1: { value: '#0E1511' },
      2: { value: '#141A15' },
      3: { value: '#1B2A1E' },
      4: { value: '#1D3A24' },
      5: { value: '#25482D' },
      6: { value: '#2D5736' },
      7: { value: '#366740' },
      8: { value: '#3E7949' },
      9: { value: '#46A758' },
      10: { value: '#53B365' },
      11: { value: '#71D083' },
      12: { value: '#C2F0C2' },
    },
    // The card table's green felt: lit in the middle by the lamp, falling into shadow at the edge.
    felt: {
      light: { value: '#2F7D55' },
      base: { value: '#1F5E3F' },
      edge: { value: '#0C2318' },
    },
    status: {
      red: { value: '#E5484D' },
      green: { value: '#30A46C' },
    },
    // Paper: warm white, ruled lines and ink.
    notebook: {
      paper: { value: '#FBF8F1' },
      paperShade: { value: '#EFE9DC' },
      ink: { value: '#26251F' },
      muted: { value: '#7A756A' },
      rule: { value: '#DCE3EC' },
      margin: { value: '#F0B9B4' },
      bubble: { value: '#FFFFFF' },
      tape: { value: 'rgba(244, 222, 130, 0.78)' },
      spiral: { value: '#A9A499' },
      heart: { value: '#E5484D' },
      heartTint: { value: '#FFE4E4' },
      star: { value: '#F2B53A' },
    },
    // The art desk: muted oak, its dark edges, and light writing on it.
    desk: {
      wood: { value: '#6B5B4C' },
      // The desk seen through a punched hole, in shadow.
      hole: { value: '#3A3027' },
      edge: { value: '#0E0E0D' },
      chalk: { value: '#EEF2E4' },
      chalkMuted: { value: 'rgba(238, 242, 228, 0.62)' },
    },
    // Things lying on the desk.
    stationery: {
      sticky: { value: '#FFE37A' },
      stickyEdge: { value: '#F2CF4F' },
      stickyPink: { value: '#FFBCCB' },
      stickyBlue: { value: '#BDE3F8' },
      stickyGreen: { value: '#CDEDB0' },
      card: { value: '#FFFDF6' },
      cardRule: { value: '#CADCEB' },
      cardTop: { value: '#E8A3A0' },
      stamp: { value: '#D93B3B' },
      stampBlue: { value: '#3F5FD9' },
      stampGreen: { value: '#2E9A5B' },
      kraft: { value: '#C7A27A' },
      kraftDeep: { value: '#A9845E' },
      backing: { value: '#E9E6DE' },
      clip: { value: '#2B2B2A' },
      tapeBlue: { value: 'rgba(140, 196, 236, 0.82)' },
      tapePink: { value: 'rgba(246, 168, 196, 0.82)' },
    },
    player: {
      raspberry: { value: '#E01E5A' },
      sky: { value: '#1D9BD1' },
      green: { value: '#2EB67D' },
      mustard: { value: '#ECB22E' },
      violet: { value: '#8E5BD9' },
      orange: { value: '#F2711C' },
      teal: { value: '#0FA3A3' },
      pink: { value: '#E255A1' },
      lime: { value: '#7CB342' },
      indigo: { value: '#4F6BED' },
    },
  },
});
