import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CloseIcon, LogoMark } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRuleBookPage } from './page';
import {
  RoomRuleBookBackdrop,
  RoomRuleBookBody,
  RoomRuleBookClose,
  RoomRuleBookContent,
  RoomRuleBookHead,
  RoomRuleBookNew,
  RoomRuleBookPositioner,
  RoomRuleBookStaple,
  RoomRuleBookTitle,
} from './styled-components';
import { RoomRuleBookTabs } from './tabs';

// The rule book (spec D27, §9.1), over everything: the leaflet's header, its index tabs and the
// page. It never pauses the game; Escape, the backdrop or the close button put it away.
export const RoomRuleBook = observer(function RoomRuleBook(): ReactElement {
  const { locale, ruleBook } = useRootStore();
  const { t } = locale;

  return (
    <Dialog.Root open={ruleBook.isOpen} onOpenChange={(details) => ruleBook.setOpen(details.open)} lazyMount unmountOnExit>
      <Portal>
        <RoomRuleBookBackdrop />
        <RoomRuleBookPositioner>
          <RoomRuleBookContent>
            <RoomRuleBookHead>
              <RoomRuleBookStaple aria-hidden />
              <LogoMark />
              <RoomRuleBookTitle>{t('book.title')}</RoomRuleBookTitle>
              <RoomRuleBookNew aria-hidden>{t('book.new')}</RoomRuleBookNew>
              <RoomRuleBookClose aria-label={t('book.close')} title={t('book.close')}>
                <CloseIcon />
              </RoomRuleBookClose>
            </RoomRuleBookHead>
            <RoomRuleBookBody>
              <RoomRuleBookTabs />
              <RoomRuleBookPage />
            </RoomRuleBookBody>
          </RoomRuleBookContent>
        </RoomRuleBookPositioner>
      </Portal>
    </Dialog.Root>
  );
});
