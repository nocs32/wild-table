import { Slider } from '@ark-ui/react/slider';
import { styled } from 'styled-system/jsx';

// Side by side on a wide screen, stacked on a narrow one. Each lies on the table: the guest list
// on a clipboard and the settings on an index card held by a binder clip. Both are stand-ins from
// Telephone Table until the room's own style comes in (spec §8.1).
export const RoomLobbyRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateAreas: '"players" "settings"',
    gap: '28px 32px',
    paddingInline: '14px',
    paddingTop: '30px',
    paddingBottom: '16px',
    md: { gridTemplateColumns: '250px 360px', gridTemplateAreas: '"players settings"', justifyContent: 'center', alignItems: 'start', paddingTop: '48px' },
  },
});

export const RoomLobbyCard = styled('section', {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    minWidth: '0',
    minHeight: '0',
    padding: '16px',
    color: 'notebook.ink',
    // Backwards only: once it has landed, its own tilt shows.
    animation: 'deal 0.4s cubic-bezier(0.2, 0.8, 0.3, 1.1) backwards',
    _motionReduce: { animation: 'none' },
  },
  variants: {
    area: {
      // A hardboard clipboard (public/textures/hardboard.svg), with a ruler printed down its edge: the
      // sheet of paper lies on it under a chrome lever clip.
      players: {
        gridArea: 'players',
        alignSelf: 'start',
        maxHeight: '100%',
        paddingTop: '30px',
        paddingInline: '11px',
        paddingBottom: '13px',
        borderRadius: '14px',
        bg: '#7A5A3D',
        bgImage: "linear-gradient(115deg, rgba(255, 255, 255, 0.13), transparent 32%, transparent 68%, rgba(0, 0, 0, 0.16)), linear-gradient(rgba(255, 248, 235, 0.4) 1px, transparent 1px), url('/textures/hardboard.svg')",
        bgSize: '100% 100%, 5px 8px, 320px 320px',
        bgPosition: '0 0, 3px 34px, 0 0',
        bgRepeat: 'no-repeat, repeat-y, repeat',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -2px 1px rgba(0, 0, 0, 0.28), inset 1px 0 0 rgba(255, 255, 255, 0.08), 0 1px 0 rgba(0, 0, 0, 0.5), 0 18px 30px -10px rgba(0, 0, 0, 0.6), 0 3px 6px rgba(0, 0, 0, 0.35)',
        transform: 'rotate(-1.2deg)',
        _before: { content: '""', position: 'absolute', zIndex: '2', top: '8px', left: '50%', width: '128px', height: '34px', marginLeft: '-64px', borderRadius: '6px 6px 12px 12px', bgImage: 'radial-gradient(circle at 15px 55%, #5F5F5B 0 2.5px, #EDEDE9 3px 4px, transparent 4.5px), radial-gradient(circle at calc(100% - 15px) 55%, #5F5F5B 0 2.5px, #EDEDE9 3px 4px, transparent 4.5px), linear-gradient(#FBFBF9, #D2D2CD 38%, #9C9C97 52%, #CFCFCA 78%, #A9A9A4)', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 5px rgba(0, 0, 0, 0.35), 0 1px 1px rgba(0, 0, 0, 0.4)' },
        _after: { content: '""', position: 'absolute', zIndex: '3', top: '-6px', left: '50%', width: '78px', height: '24px', marginLeft: '-39px', borderRadius: '14px 14px 5px 5px', bgImage: 'linear-gradient(#FFFFFF, #CACAC5 45%, #8E8E89 60%, #C4C4BF)', boxShadow: '0 3px 4px rgba(0, 0, 0, 0.35)', maskImage: 'radial-gradient(ellipse 20px 5px at 50% 42%, transparent 96%, black 100%)' },
      },
      // An index card: a red line under the title, blue lines below, and a binder clip on top.
      settings: {
        gridArea: 'settings',
        alignSelf: 'start',
        paddingTop: '20px',
        borderRadius: '4px',
        bg: 'stationery.card',
        bgImage: 'linear-gradient(transparent 70px, {colors.stationery.cardTop} 70px 72px, transparent 72px), repeating-linear-gradient(transparent 0 27px, rgba(202, 220, 235, 0.55) 27px 28px)',
        bgPosition: '0 0, 0 72px',
        boxShadow: '0 18px 30px -10px rgba(0, 0, 0, 0.6), 0 3px 6px rgba(0, 0, 0, 0.35)',
        animationDelay: '0.06s',
        _before: { content: '""', position: 'absolute', top: '-12px', left: '50%', width: '74px', height: '22px', marginLeft: '-37px', borderRadius: '3px 3px 6px 6px', bgImage: 'linear-gradient(#3A3A38, #141413)', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)' },
        _after: { content: '""', position: 'absolute', top: '-30px', left: '50%', width: '50px', height: '22px', marginLeft: '-25px', borderRadius: '12px 12px 0 0', border: '3px solid #C9C9C3', borderBottom: 'none' },
      },
    },
  },
});

export const RoomLobbyCardTitle = styled('h2', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: '900', '& svg': { width: '18px', height: '18px', color: 'notebook.muted' } },
});

// The sheet of paper on the clipboard, under the clip.
export const RoomLobbyPlayersSheet = styled('div', {
  base: { position: 'relative', zIndex: '1', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '0', paddingTop: '22px', paddingInline: '14px', paddingBottom: '12px', borderRadius: '2px', bg: 'stationery.card', bgImage: 'repeating-linear-gradient(transparent 0 21px, {colors.stationery.cardRule} 21px 22px)', bgPosition: '0 6px', boxShadow: '0 1px 1px rgba(0, 0, 0, 0.18), 0 3px 8px rgba(0, 0, 0, 0.28)' },
});

export const RoomLobbyPlayersList = styled('ul', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '6px 16px', md: { flexDirection: 'column', flexWrap: 'nowrap', gap: '0', overflowY: 'auto' } },
});

export const RoomLobbyPlayersItem = styled('li', {
  base: { display: 'flex', alignItems: 'center', gap: '10px', minHeight: '44px', paddingInline: '2px', animation: 'dialogIn 0.3s ease-out' },
});

export const RoomLobbyPlayersName = styled('span', {
  base: { minWidth: '0', fontSize: '15px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomLobbyPlayersNote = styled('span', {
  base: { fontSize: '12px', fontWeight: '700', color: 'notebook.muted' },
});

export const RoomLobbySettingsHead = styled('header', {
  base: { display: 'grid', gap: '2px' },
});

export const RoomLobbySettingsSubtitle = styled('p', {
  base: { fontSize: '13px', color: 'notebook.muted' },
});

export const RoomLobbyField = styled('div', {
  base: { display: 'grid', gap: '8px' },
});

export const RoomLobbyFieldHead = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' },
});

export const RoomLobbyLabel = styled('label', {
  base: { fontSize: '14px', fontWeight: '700' },
});

export const RoomLobbyValue = styled('span', {
  base: { fontSize: '14px', fontWeight: '900', color: 'accent.default', fontVariantNumeric: 'tabular-nums' },
});

export const RoomLobbyHint = styled('span', {
  base: { fontSize: '12px', color: 'notebook.muted' },
});

export const RoomLobbySliderRoot = styled(Slider.Root, {
  base: { display: 'grid', gap: '10px', '&[data-disabled]': { opacity: '0.55' } },
});

export const RoomLobbySliderControl = styled(Slider.Control, {
  base: { position: 'relative', display: 'flex', alignItems: 'center', height: '20px' },
});

export const RoomLobbySliderTrack = styled(Slider.Track, {
  base: { flex: '1', height: '6px', borderRadius: 'full', bg: 'rgba(38, 37, 31, 0.14)', overflow: 'hidden' },
});

export const RoomLobbySliderRange = styled(Slider.Range, {
  base: { height: '100%', bg: 'accent.default' },
});

export const RoomLobbySliderThumb = styled(Slider.Thumb, {
  base: {
    width: '20px',
    height: '20px',
    borderRadius: 'full',
    bg: 'white',
    border: '3px solid',
    borderColor: 'accent.default',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    cursor: 'grab',
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});

export const RoomLobbyInviteRoot = styled('footer', {
  base: { display: 'grid', gap: '10px', marginTop: 'auto', paddingTop: '14px', borderTop: '2px dashed', borderColor: 'rgba(38, 37, 31, 0.18)' },
});

export const RoomLobbyInviteHint = styled('p', {
  base: { fontSize: '13px', color: 'notebook.muted' },
});

export const RoomLobbyInviteButtons = styled('div', {
  base: { display: 'flex', '& > button': { flex: '1' } },
});
