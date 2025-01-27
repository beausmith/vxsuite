import React, { useEffect } from 'react';
import { Text } from '@votingworks/ui';
import { TimesCircle } from '../components/graphics';
import {
  CenteredLargeProse,
  ScreenMainCenterChild,
} from '../components/layout';
import { ScannedBallotCount } from '../components/scanned_ballot_count';
import { useSound } from '../hooks/use_sound';

interface Props {
  scannedBallotCount: number;
}

export function ScanJamScreen({ scannedBallotCount }: Props): JSX.Element {
  const playError = useSound('error');
  useEffect(playError, [playError]);

  return (
    <ScreenMainCenterChild infoBar={false}>
      <TimesCircle />
      <CenteredLargeProse>
        <h1>Ballot Not Counted</h1>
        <p>The ballot is jammed in the scanner.</p>
        <Text small italic>
          Ask a poll worker for help.
        </Text>
      </CenteredLargeProse>
      <ScannedBallotCount count={scannedBallotCount} />
    </ScreenMainCenterChild>
  );
}

/* istanbul ignore next */
export function DefaultPreview(): JSX.Element {
  return <ScanJamScreen scannedBallotCount={42} />;
}
