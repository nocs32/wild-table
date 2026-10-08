import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import type { ReactElement } from 'react';
import { Button, ConfirmPopoverButtons, ConfirmPopoverNote, ConfirmPopoverText, ConfirmPopoverTitle, PanelContent } from './styled-components';

interface ConfirmPopoverProps {
  title: string;
  note?: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
  // The button that opens it.
  children: ReactElement;
}

// Asks before something that can't be taken back, such as leaving a match.
// The buttons name themselves: Ark would otherwise label both "close".
export function ConfirmPopover({ title, note, cancelLabel, confirmLabel, onConfirm, children }: ConfirmPopoverProps): ReactElement {
  return (
    <Popover.Root positioning={{ placement: 'top', gutter: 10 }} lazyMount>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <PanelContent>
            <ConfirmPopoverText>
              <Popover.Title asChild>
                <ConfirmPopoverTitle>{title}</ConfirmPopoverTitle>
              </Popover.Title>
              {note && (
                <Popover.Description asChild>
                  <ConfirmPopoverNote>{note}</ConfirmPopoverNote>
                </Popover.Description>
              )}
            </ConfirmPopoverText>
            <ConfirmPopoverButtons>
              <Popover.CloseTrigger asChild>
                <Button tone="secondary" size="sm" type="button" aria-label={cancelLabel}>
                  {cancelLabel}
                </Button>
              </Popover.CloseTrigger>
              <Popover.CloseTrigger asChild>
                <Button tone="danger" size="sm" type="button" aria-label={confirmLabel} onClick={onConfirm}>
                  {confirmLabel}
                </Button>
              </Popover.CloseTrigger>
            </ConfirmPopoverButtons>
          </PanelContent>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
