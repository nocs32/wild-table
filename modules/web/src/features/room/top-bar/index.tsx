import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { BookIcon, LogoMark, SendIcon, SpinnerIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomTopBarDemo } from './demo';
import { RoomTopBarLink } from './link';
import { RoomTopBarPeople } from './people';
import { RoomTopBarSound } from './sound';
import {
  RoomTopBarBrand,
  RoomTopBarButtonLabel,
  RoomTopBarEnd,
  RoomTopBarLanguage,
  RoomTopBarReconnecting,
  RoomTopBarRoot,
  RoomTopBarStart,
} from './styled-components';

// The brand, the table's link, who's here, the rule book (always one click away, spec §9.1),
// sound, language and Share.
export const RoomTopBar = observer(function RoomTopBar(): ReactElement {
  const { locale, room, ruleBook } = useRootStore();
  const { t } = locale;

  return (
    <RoomTopBarRoot>
      <RoomTopBarStart>
        <RoomTopBarBrand>
          <LogoMark />
          Wild Table
        </RoomTopBarBrand>
        <RoomTopBarDemo />
        {room.connection.isReconnecting && (
          <RoomTopBarReconnecting role="status">
            <SpinnerIcon />
            {t('status.reconnecting')}
          </RoomTopBarReconnecting>
        )}
      </RoomTopBarStart>
      <RoomTopBarLink />
      <RoomTopBarEnd>
        <RoomTopBarPeople />
        <Button tone="secondary" size="sm" type="button" title={t('book.openHint')} aria-label={t('book.openHint')} onClick={() => ruleBook.open()}>
          <BookIcon />
          <RoomTopBarButtonLabel>{t('book.open')}</RoomTopBarButtonLabel>
        </Button>
        <RoomTopBarSound />
        <RoomTopBarLanguage type="button" aria-label={locale.toggleLabel} title={locale.toggleLabel} onClick={locale.toggle}>
          {locale.code}
        </RoomTopBarLanguage>
        <Button tone="primary" size="sm" type="button" onClick={room.share.copy}>
          <SendIcon />
          <RoomTopBarButtonLabel>{room.share.shareLabel}</RoomTopBarButtonLabel>
        </Button>
      </RoomTopBarEnd>
    </RoomTopBarRoot>
  );
});
