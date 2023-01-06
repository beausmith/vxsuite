import React, { useContext, useEffect } from 'react';

import {
  Button,
  Prose,
  Modal,
  sizeThemes,
  contrastThemes,
  ModalWidth,
} from '@votingworks/ui';
import { ThemeProvider } from 'styled-components';
import { BallotContext } from '../contexts/ballot_context';
import { SettingsTextSize } from '../components/settings_text_size';
import { handleGamepadKeyboardEvent } from '../lib/gamepad';
import { DEFAULT_USER_SETTINGS } from '../config/globals';
import { SettingsContrast } from '../components/settings_contrast';

export function VoterSettingsModal(): JSX.Element {
  const { userSettings, setUserSettings } = useContext(BallotContext);

  function closeUserSettingsModal() {
    return setUserSettings({ showSettingsModal: false });
  }

  function resetUserSettingsToDefaults() {
    setUserSettings(DEFAULT_USER_SETTINGS);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        event.stopPropagation();
        handleGamepadKeyboardEvent({ ...event, key: 'ArrowDown' });
      }
      if (event.key === 'ArrowLeft') {
        event.stopPropagation();
        handleGamepadKeyboardEvent({ ...event, key: 'ArrowUp' });
      }
    }
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  return (
    <ThemeProvider
      theme={{
        size: sizeThemes[userSettings.sizeTheme],
        contrast: contrastThemes[userSettings.contrastTheme],
      }}
    >
      <Modal
        modalWidth={ModalWidth.NearlyCovering}
        content={
          <Prose textCenter maxWidth={false} id="modalaudiofocus">
            <h1>Voter Settings</h1>
            <span aria-label="Navigate through the settings using the up and down buttons. Use the select button to select a setting. When you are done, use the right or left arrow to close settings." />
            <SettingsTextSize
              userSettings={userSettings}
              setUserSettings={setUserSettings}
            />
            <SettingsContrast
              userSettings={userSettings}
              setUserSettings={setUserSettings}
            />
          </Prose>
        }
        actions={
          <React.Fragment>
            <Button
              primary
              onPress={closeUserSettingsModal}
              aria-label="Close Settings"
            >
              Done
            </Button>
            <Button onPress={resetUserSettingsToDefaults}>
              Use Default Settings
            </Button>
          </React.Fragment>
        }
      />
    </ThemeProvider>
  );
}
