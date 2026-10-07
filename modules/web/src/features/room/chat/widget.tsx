import { observer } from 'mobx-react-lite';
import type { ReactElement, ReactNode } from 'react';
import type { UiWidgetsFrameStore } from '../../../stores/ui/widgets/frame';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomChatWidgetResize, RoomChatWidgetRoot } from './styled-components';
import { useRoomChatWidget } from './use-widget';

interface RoomChatWidgetProps {
  frame: UiWidgetsFrameStore;
  label: string;
  children: ReactNode;
}

// Felt Table's floating card: children mark their drag area with data-widget-move; the corner
// handle resizes.
export const RoomChatWidget = observer(function RoomChatWidget({ frame, label, children }: RoomChatWidgetProps): ReactElement {
  const { locale } = useRootStore();
  const ref = useRoomChatWidget(frame);

  return (
    <RoomChatWidgetRoot ref={ref} data-widget aria-label={label} gesture={frame.gesture}>
      {children}
      <RoomChatWidgetResize data-widget-resize title={locale.t('chat.resize')} aria-hidden />
    </RoomChatWidgetRoot>
  );
});
