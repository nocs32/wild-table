import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { FlaskIcon, UserMinusIcon, UserPlusIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { IconButton } from '../../../ui';
import { RoomTopBarDemoLabel, RoomTopBarDemoRoot } from './styled-components';

// Only on the demo table: change who's playing, for trying it alone.
export const RoomTopBarDemo = observer(function RoomTopBarDemo(): ReactElement | null {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { demo } = room;

  if (!demo) return null;

  return (
    <RoomTopBarDemoRoot role="toolbar" aria-label={t('demo.title')}>
      <RoomTopBarDemoLabel title={t('demo.hint')}>
        <FlaskIcon />
        {t('demo.title')}
      </RoomTopBarDemoLabel>
      <IconButton type="button" onClick={demo.addPlayer} aria-label={t('demo.addPlayer')} title={t('demo.addPlayer')}>
        <UserPlusIcon />
      </IconButton>
      <IconButton type="button" onClick={demo.removePlayer} aria-label={t('demo.removePlayer')} title={t('demo.removePlayer')}>
        <UserMinusIcon />
      </IconButton>
    </RoomTopBarDemoRoot>
  );
});
