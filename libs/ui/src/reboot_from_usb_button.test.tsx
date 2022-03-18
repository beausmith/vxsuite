import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { usbstick } from '@votingworks/utils';
import { fakeKiosk } from '@votingworks/test-utils';
import { Logger, LogSource } from '@votingworks/logging';
import { RebootFromUsbButton } from './reboot_from_usb_button';

beforeEach(() => {
  window.kiosk = fakeKiosk();
});

test('renders without a USB drive as expected.', async () => {
  const { container } = render(
    <RebootFromUsbButton
      usbDriveStatus={usbstick.UsbDriveStatus.absent}
      logger={new Logger(LogSource.VxAdminFrontend)}
    />
  );
  // Initially should just contain the button
  expect(container).toMatchInlineSnapshot(`
    <div>
      <button
        class="sc-gsDJrp dmKzwC"
        type="button"
      >
        Reboot from USB
      </button>
    </div>
  `);
  await act(
    async () => await fireEvent.click(screen.getByText('Reboot from USB'))
  );
  screen.getByText('No USB Drive Detected');
});

test('renders with a non-bootable USB as expected', async () => {
  window.kiosk!.prepareToBootFromUsb = jest.fn().mockResolvedValue(false);
  render(
    <RebootFromUsbButton
      usbDriveStatus={usbstick.UsbDriveStatus.mounted}
      logger={new Logger(LogSource.VxAdminFrontend)}
    />
  );
  await act(
    async () => await fireEvent.click(screen.getByText('Reboot from USB'))
  );
  await waitFor(() =>
    screen.getByText(
      /The USB Drive was not found in the list of bootable devices./
    )
  );
  expect(window.kiosk!.prepareToBootFromUsb).toHaveBeenCalledTimes(1);
  expect(window.kiosk!.reboot).toHaveBeenCalledTimes(0);
  await fireEvent.click(screen.getByText('Close'));
  expect(
    screen.queryAllByText(
      /The USB Drive was not found in the list of bootable devices./
    )
  ).toHaveLength(0);
  await act(
    async () => await fireEvent.click(screen.getByText('Reboot from USB'))
  );
  await waitFor(() =>
    screen.getByText(
      /The USB Drive was not found in the list of bootable devices./
    )
  );
  await act(async () => await fireEvent.click(screen.getByText('Reboot')));
  await screen.getByText('Rebooting…');
  expect(window.kiosk!.reboot).toHaveBeenCalledTimes(1);
});

test('reboots automatically when clicked with a bootable USB', async () => {
  window.kiosk!.prepareToBootFromUsb = jest.fn().mockResolvedValue(true);
  render(
    <RebootFromUsbButton
      usbDriveStatus={usbstick.UsbDriveStatus.mounted}
      logger={new Logger(LogSource.VxAdminFrontend)}
    />
  );
  await act(
    async () => await fireEvent.click(screen.getByText('Reboot from USB'))
  );
  await waitFor(() => screen.getByText('Rebooting…'));
  expect(window.kiosk!.prepareToBootFromUsb).toHaveBeenCalledTimes(1);
  expect(window.kiosk!.reboot).toHaveBeenCalledTimes(1);
});

test('modal state updates when USB drive is inserted.', async () => {
  window.kiosk!.prepareToBootFromUsb = jest.fn().mockResolvedValue(false);
  const { rerender } = render(
    <RebootFromUsbButton
      usbDriveStatus={usbstick.UsbDriveStatus.absent}
      logger={new Logger(LogSource.VxAdminFrontend)}
    />
  );
  await act(
    async () => await fireEvent.click(screen.getByText('Reboot from USB'))
  );
  await waitFor(() => screen.getByText('No USB Drive Detected'));
  rerender(
    <RebootFromUsbButton
      usbDriveStatus={usbstick.UsbDriveStatus.mounted}
      logger={new Logger(LogSource.VxAdminFrontend)}
    />
  );
  await waitFor(() => screen.getByText(/The USB Drive was not found/));
  expect(window.kiosk!.prepareToBootFromUsb).toHaveBeenCalledTimes(1);
  expect(window.kiosk!.reboot).toHaveBeenCalledTimes(0);
});