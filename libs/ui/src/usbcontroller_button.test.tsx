import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { UsbControllerButton } from './usbcontroller_button';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
  delete window.kiosk;
});

test('shows No USB if usb absent', () => {
  const eject = jest.fn();
  const { container, getByText } = render(
    <UsbControllerButton usbDriveStatus="absent" usbDriveEject={eject} />
  );

  expect(container.firstChild).toHaveTextContent('No USB');
  fireEvent.click(getByText('No USB'));
  expect(eject).not.toHaveBeenCalled();
});

test('shows eject if mounted', () => {
  const eject = jest.fn();
  const { container, getByText } = render(
    <UsbControllerButton usbDriveStatus="mounted" usbDriveEject={eject} />
  );

  expect(container.firstChild).toHaveTextContent('Eject USB');
  fireEvent.click(getByText('Eject USB'));
  expect(eject).toHaveBeenCalled();
});

test('shows ejected if recently ejected', () => {
  const eject = jest.fn();
  const { container, getByText } = render(
    <UsbControllerButton usbDriveStatus="ejected" usbDriveEject={eject} />
  );

  expect(container.firstChild).toHaveTextContent('Ejected');
  fireEvent.click(getByText('Ejected'));
  expect(eject).not.toHaveBeenCalled();
});

test('shows connecting while mounting', () => {
  const eject = jest.fn();
  const { container, getByText } = render(
    <UsbControllerButton usbDriveStatus="mounting" usbDriveEject={eject} />
  );

  expect(container.firstChild).toHaveTextContent('Connecting…');
  fireEvent.click(getByText('Connecting…'));
  expect(eject).not.toHaveBeenCalled();
});

test('shows ejecting while ejecting', () => {
  const eject = jest.fn();
  const { container, getByText } = render(
    <UsbControllerButton usbDriveStatus="ejecting" usbDriveEject={eject} />
  );

  expect(container.firstChild).toHaveTextContent('Ejecting…');
  fireEvent.click(getByText('Ejecting…'));
  expect(eject).not.toHaveBeenCalled();
});
