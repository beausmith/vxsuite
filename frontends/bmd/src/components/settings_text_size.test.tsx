import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { DEFAULT_USER_SETTINGS } from '../config/globals';
import { UserSettings } from '../config/types';
import { SettingsTextSize } from './settings_text_size';

const userSettings: UserSettings = DEFAULT_USER_SETTINGS;
const setUserSettings = jest.fn();

it('renders SettingsTextSize', () => {
  const { container, getAllByText } = render(
    <SettingsTextSize
      userSettings={userSettings}
      setUserSettings={setUserSettings}
    />
  );
  expect(container.firstChild).toMatchSnapshot();
  const buttons = getAllByText('A');
  expect(buttons.length).toBe(4);
  fireEvent.click(buttons[0]);
  expect(setUserSettings).toBeCalledWith({ sizeTheme: 'S' });
  fireEvent.click(buttons[1]);
  expect(setUserSettings).toBeCalledWith({ sizeTheme: 'M' });
  fireEvent.click(buttons[2]);
  expect(setUserSettings).toBeCalledWith({ sizeTheme: 'L' });
  fireEvent.click(buttons[3]);
  expect(setUserSettings).toBeCalledWith({ sizeTheme: 'XL' });
});
