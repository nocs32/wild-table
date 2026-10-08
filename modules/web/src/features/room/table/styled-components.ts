import { styled } from 'styled-system/jsx';

// The canvas fills the room; the lobby floats over it.
export const RoomTableRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '1', touchAction: 'none', animation: 'fadeIn 0.8s ease-out' },
});
