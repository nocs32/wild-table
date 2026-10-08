import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon, CloseIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRuleBookExample } from '../parts';
import { RoomRuleBookLead, RoomRuleBookText } from '../styled-components';
import { RoomRuleBookBox, RoomRuleBookBoxTitle, RoomRuleBookPair } from './styled-components';

// Page 4, Wild +4 and the challenge (spec §5.5): the same +4 fair in one hand and a bluff in the
// other, and what each answer costs.
export const RoomRuleBookPageWild4 = observer(function RoomRuleBookPageWild4(): ReactElement {
  const { locale, ruleBook } = useRootStore();
  const { t } = locale;
  const { fair, bluff } = ruleBook.wild4;

  return (
    <>
      <RoomRuleBookLead>{t('book.wild4.lead')}</RoomRuleBookLead>
      <RoomRuleBookBox tone="good">
        <RoomRuleBookBoxTitle tone="good">
          <CheckIcon />
          {t('book.wild4.fair')}
        </RoomRuleBookBoxTitle>
        <RoomRuleBookExample example={fair} />
        <RoomRuleBookText>{t('book.wild4.fairNote')}</RoomRuleBookText>
      </RoomRuleBookBox>
      <RoomRuleBookBox tone="bad">
        <RoomRuleBookBoxTitle tone="bad">
          <CloseIcon />
          {t('book.wild4.bluff')}
        </RoomRuleBookBoxTitle>
        <RoomRuleBookExample example={bluff} />
        <RoomRuleBookText>{t('book.wild4.bluffNote')}</RoomRuleBookText>
      </RoomRuleBookBox>
      <RoomRuleBookText>{t('book.wild4.choice')}</RoomRuleBookText>
      <RoomRuleBookPair>
        <RoomRuleBookBox>
          <RoomRuleBookBoxTitle>{t('book.wild4.take')}</RoomRuleBookBoxTitle>
          <RoomRuleBookText>{t('book.wild4.takeText')}</RoomRuleBookText>
        </RoomRuleBookBox>
        <RoomRuleBookBox>
          <RoomRuleBookBoxTitle>{t('book.wild4.challenge')}</RoomRuleBookBoxTitle>
          <RoomRuleBookText>{t('book.wild4.challengeText')}</RoomRuleBookText>
        </RoomRuleBookBox>
      </RoomRuleBookPair>
    </>
  );
});
