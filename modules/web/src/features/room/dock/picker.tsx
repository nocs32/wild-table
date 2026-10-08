import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { EmojiPicker } from 'frimousse';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { AddReactionIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import {
  RoomDockButton,
  RoomDockPickerActive,
  RoomDockPickerEmpty,
  RoomDockPickerFooter,
  RoomDockPickerLoading,
  RoomDockPickerRoot,
  RoomDockPickerSearch,
  RoomDockPickerViewport,
  RoomDockPopover,
} from './styled-components';

// Slack's emoji picker: search on top, every emoji below. Picks fly up and join the quick bar;
// the picker stays open so you can keep sending.
export const RoomDockPicker = observer(function RoomDockPicker(): ReactElement {
  const { locale, room, ui } = useRootStore();

  return (
    <Popover.Root positioning={{ placement: ui.layout.isCompact ? 'right-end' : 'top', gutter: 12 }} lazyMount>
      <Popover.Trigger asChild>
        <RoomDockButton type="button" aria-label={locale.t('reactions.more')} title={locale.t('reactions.more')}>
          <AddReactionIcon />
        </RoomDockButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <RoomDockPopover>
            <RoomDockPickerRoot locale={locale.language} columns={9} onEmojiSelect={({ emoji }) => room.reactions.pick(emoji)}>
              <RoomDockPickerSearch placeholder={locale.t('picker.search')} aria-label={locale.t('picker.search')} />
              <RoomDockPickerViewport>
                <RoomDockPickerLoading>{locale.t('picker.loading')}</RoomDockPickerLoading>
                <RoomDockPickerEmpty>{locale.t('picker.empty')}</RoomDockPickerEmpty>
                <EmojiPicker.List />
              </RoomDockPickerViewport>
              <RoomDockPickerFooter>
                <EmojiPicker.ActiveEmoji>
                  {({ emoji }) => (
                    <>
                      <RoomDockPickerActive>{emoji?.emoji ?? '🃏'}</RoomDockPickerActive>
                      {emoji?.label ?? locale.t('picker.hint')}
                    </>
                  )}
                </EmojiPicker.ActiveEmoji>
              </RoomDockPickerFooter>
            </RoomDockPickerRoot>
          </RoomDockPopover>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
});
