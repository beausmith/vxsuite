import React from 'react';
import { Logger } from '@votingworks/logging';
import { usbstick, isVxDev } from '@votingworks/utils';

import { Button } from './button';
import { Main } from './main';
import { Prose } from './prose';
import { Text } from './text';
import { RebootFromUsbButton } from './reboot_from_usb_button';
import { RebootToBiosButton } from './reboot_to_bios_button';
import { UnconfigureMachineButton } from './unconfigure_machine_button';
import { ResetPollsToPausedButton } from './reset_polls_to_paused_button';

interface Props {
  logger: Logger;
  currentElectionInstructions: React.ReactNode;
  unconfigureMachine: () => Promise<void>;
  resetPollsToPausedText?: string;
  resetPollsToPaused?: () => Promise<void>;
  isMachineConfigured: boolean;
  usbDriveStatus: usbstick.UsbDriveStatus;
}

/**
 * A component for system administrator (formerly super admin) screen contents on non-VxAdmin
 * machines
 */
export function SystemAdministratorScreenContents({
  logger,
  currentElectionInstructions,
  unconfigureMachine,
  resetPollsToPausedText,
  resetPollsToPaused,
  isMachineConfigured,
  usbDriveStatus,
}: Props): JSX.Element {
  return (
    <Main padded centerChild>
      <Prose textCenter>
        <Text italic>{currentElectionInstructions}</Text>
        <h1>System Administrator Actions</h1>
        <Text italic>Remove the card to continue.</Text>
        {resetPollsToPausedText && (
          <p>
            <ResetPollsToPausedButton
              resetPollsToPausedText={resetPollsToPausedText}
              resetPollsToPaused={resetPollsToPaused}
              logger={logger}
            />
          </p>
        )}
        <p>
          <RebootFromUsbButton
            usbDriveStatus={usbDriveStatus}
            logger={logger}
          />{' '}
          <RebootToBiosButton logger={logger} />
        </p>
        <p>
          <UnconfigureMachineButton
            unconfigureMachine={unconfigureMachine}
            isMachineConfigured={isMachineConfigured}
          />
        </p>
        {isVxDev() && (
          <p>
            <Button onPress={() => window.kiosk?.quit()}>Quit</Button>
          </p>
        )}
      </Prose>
    </Main>
  );
}
