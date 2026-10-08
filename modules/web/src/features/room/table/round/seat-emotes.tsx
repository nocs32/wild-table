import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { RoomGameEmotesStore } from '../../../../stores/room/game/emotes';
import type { MatchSeatView } from '../../../../stores/room/game/match';
import { Avatar, Button, PanelContent } from '../../../../ui';
import { RoomTableRoundSeatChip, RoomTableRoundSeatEmotesList, RoomTableRoundSeatEmotesTitle } from './styled-components';

interface RoomTableRoundSeatEmotesProps {
  seat: MatchSeatView;
  // Handed in: drei's Html draws this in a React root of its own, out of reach of the store's context.
  emotes: RoomGameEmotesStore;
  title: string;
  hint: string;
}

// Your own chip: click it for your emotes (spec §7), each said in a speech bubble at your place.
export const RoomTableRoundSeatEmotes = observer(function RoomTableRoundSeatEmotes({ seat, emotes, title, hint }: RoomTableRoundSeatEmotesProps): ReactElement {
  return (
    <Popover.Root open={emotes.isOpen} onOpenChange={(details) => emotes.setOpen(details.open)} positioning={{ placement: 'top', gutter: 10 }} lazyMount>
      <Popover.Trigger asChild>
        <RoomTableRoundSeatChip type="button" aria-label={hint} title={hint}>
          <Avatar initial={seat.initial} color={seat.color} size="md" bot={seat.isBot} />
        </RoomTableRoundSeatChip>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <PanelContent>
            <Popover.Title asChild>
              <RoomTableRoundSeatEmotesTitle>{title}</RoomTableRoundSeatEmotesTitle>
            </Popover.Title>
            <RoomTableRoundSeatEmotesList>
              {emotes.options.map((option) => (
                <Button key={option.line} type="button" size="sm" onClick={() => emotes.send(option.line)}>
                  {option.label}
                </Button>
              ))}
            </RoomTableRoundSeatEmotesList>
          </PanelContent>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
});
