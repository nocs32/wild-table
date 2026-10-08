import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { RotateIcon } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import { RoomRotateCard, RoomRotateRoot, RoomRotateText, RoomRotateTitle } from './styled-components';

// Covers everything on a phone held upright: the game is played sideways (spec D20).
export const RoomRotate = observer(function RoomRotate(): ReactElement {
  const { t } = useRootStore().locale;

  return (
    <RoomRotateRoot role="alert">
      <RoomRotateCard>
        <RotateIcon />
        <RoomRotateTitle>{t('status.rotateTitle')}</RoomRotateTitle>
        <RoomRotateText>{t('status.rotateText')}</RoomRotateText>
      </RoomRotateCard>
    </RoomRotateRoot>
  );
});
