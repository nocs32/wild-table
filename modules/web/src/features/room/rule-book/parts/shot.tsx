import type { ReactElement } from 'react';
import { RoomRuleBookShotCaption, RoomRuleBookShotImage, RoomRuleBookShotRoot } from './styled-components';

interface RoomRuleBookShotProps {
  src: string;
  caption: string;
}

// A screenshot of the table, framed like a Polaroid, with what it shows written under it.
export function RoomRuleBookShot({ src, caption }: RoomRuleBookShotProps): ReactElement {
  return (
    <RoomRuleBookShotRoot>
      <RoomRuleBookShotImage src={src} alt="" loading="lazy" />
      <RoomRuleBookShotCaption>{caption}</RoomRuleBookShotCaption>
    </RoomRuleBookShotRoot>
  );
}
