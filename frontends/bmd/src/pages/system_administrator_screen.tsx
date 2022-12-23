import React from 'react';

import { Logger } from '@votingworks/logging';
import { Screen, SystemAdministratorScreenContents } from '@votingworks/ui';
import { usbstick } from '@votingworks/utils';

const resetPollsToPausedText =
  'The polls are closed and voting is complete. After resetting the polls to paused, it will be possible to re-open the polls and resume voting. The printed ballots count will be preserved.';

interface Props {
  logger: Logger;
  unconfigureMachine: () => Promise<void>;
  isMachineConfigured: boolean;
  resetPollsToPaused?: () => Promise<void>;
  usbDriveStatus: usbstick.UsbDriveStatus;
}

/**
 * Screen when a system administrator card is inserted
 */
export function SystemAdministratorScreen({
  logger,
  unconfigureMachine,
  isMachineConfigured,
  resetPollsToPaused,
  usbDriveStatus,
}: Props): JSX.Element {
  return (
    <Screen>
      <SystemAdministratorScreenContents
        logger={logger}
        resetPollsToPausedText={resetPollsToPausedText}
        resetPollsToPaused={resetPollsToPaused}
        currentElectionInstructions={
          <React.Fragment>
            To adjust settings for the current election, please insert an
            election manager or poll worker card.
          </React.Fragment>
        }
        unconfigureMachine={unconfigureMachine}
        isMachineConfigured={isMachineConfigured}
        usbDriveStatus={usbDriveStatus}
      />
    </Screen>
  );
}
