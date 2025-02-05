import React from 'react';

import {
  CenteredLargeProse,
  ScreenMainCenterChild,
} from '../components/layout';
import { RotateCard } from '../components/graphics';

export function CardErrorScreen(): JSX.Element {
  return (
    <ScreenMainCenterChild infoBar={false}>
      <RotateCard />
      <CenteredLargeProse>
        <h1>Card is Backwards</h1>
        <p>Remove the card, turn it around, and insert it again.</p>
      </CenteredLargeProse>
    </ScreenMainCenterChild>
  );
}

/* istanbul ignore next */
export function DefaultPreview(): JSX.Element {
  return <CardErrorScreen />;
}
