import { defineTokens } from '@pandacss/dev';

// The 90s basement rec room (spec D21, §8.1). Two families of surfaces, used the same way everywhere:
// - the room itself (the top bar, the dock, the chat, popovers): dark walnut, brass trim, and
//   cream lettering under the lamp;
// - the game's printed matter (the settings card, the rule leaflet, tent cards, the status card):
//   glossy card stock with bold ink and the four card colours, straight out of a game box.
// The neon colours are the jukebox and the pinball machine glowing in the dark: highlights only.
export const tokens = defineTokens({
  fonts: {
    body: { value: '"Rubik Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
    // Headings and buttons: the same family, set heavy, like the lettering on a 90s game box.
    display: { value: '"Rubik Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
    mono: { value: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' },
    emoji: { value: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' },
  },
  colors: {
    // The basement beyond the lamp's light, from darkest to the haze around the table.
    room: {
      night: { value: '#0E0A08' },
      dusk: { value: '#16100C' },
      shade: { value: '#1F1712' },
      smoke: { value: '#2A2019' },
      haze: { value: '#3A2D23' },
    },
    // Walnut panelling and the table's wood.
    wood: {
      deep: { value: '#1E120A' },
      dark: { value: '#33200F' },
      base: { value: '#4E3018' },
      light: { value: '#6F4626' },
      grain: { value: '#8C5D35' },
    },
    // The card table's padded rail.
    leather: {
      dark: { value: '#1C110A' },
      base: { value: '#2E1C11' },
      light: { value: '#46301F' },
    },
    // Brass trim on the wood.
    brass: {
      deep: { value: '#6B5122' },
      base: { value: '#B08A43' },
      light: { value: '#DDBD78' },
      shine: { value: '#F5E0A6' },
    },
    // Printed card stock and its ink.
    print: {
      paper: { value: '#F6ECD6' },
      card: { value: '#FFF8E8' },
      shade: { value: '#E8D9B8' },
      line: { value: '#D3BF98' },
      ink: { value: '#22170E' },
      muted: { value: '#6F5C47' },
      soft: { value: '#9A866C' },
    },
    // The hanging lamp's warm light.
    lamp: {
      glow: { value: '#FFC963' },
      warm: { value: '#F3A53B' },
      deep: { value: '#B9741C' },
    },
    // The cards' four colours (each also has its own symbol, D22), their darker edges, and the
    // wilds' black.
    suit: {
      red: { value: '#E2412F' },
      redDeep: { value: '#A8281A' },
      yellow: { value: '#F5B62A' },
      yellowDeep: { value: '#C2840E' },
      green: { value: '#2F9E58' },
      greenDeep: { value: '#1D6B3A' },
      blue: { value: '#2B6AD6' },
      blueDeep: { value: '#1B479C' },
      wild: { value: '#1A1411' },
    },
    // The jukebox, the pinball machine and the neon sign glowing in the dark.
    neon: {
      pink: { value: '#FF4FA8' },
      pinkDeep: { value: '#D92A82' },
      cyan: { value: '#3FE3FF' },
      violet: { value: '#A26BFF' },
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
