import React from 'react';
import styled from 'styled-components';

import { Button, SegmentedButton } from '@votingworks/ui';

import { SetUserSettings, UserSettings } from '../config/types';
import { CONTRAST_THEMES, TEXT_SIZES } from '../config/globals';

const ContrastSegmentedButton = styled(SegmentedButton)`
  justify-content: center;
  span:not(:focus):not(:active) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    white-space: nowrap;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
  }
  button {
    min-width: ${TEXT_SIZES[1] * 3.5}px;
    &::before {
      display: block;
      margin: auto;
      border-radius: 100px;
      box-sizing: border-box;
      width: 44px;
      height: 44px;
      line-height: 40px;
      font-weight: 700;
      content: '';
    }
    &[data-contrast='black'] {
      &::before {
        border: 2px solid #000000;
        background: #ffffff;
        color: #000000;
      }
    }
    &[data-contrast='white'] {
      &::before {
        border: 2px solid #ffffff;
        background: #000000;
        color: #ffffff;
      }
    }
    &[data-contrast='grey'] {
      &::before {
        border: 2px solid #ffffff;
        background: #666666;
        color: #ffffff;
      }
    }
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.4rem;
`;

interface Props {
  userSettings: UserSettings;
  setUserSettings: SetUserSettings;
}

export function SettingsContrast({
  userSettings,
  setUserSettings,
}: Props): JSX.Element {
  return (
    <p>
      <Label aria-hidden>Contrast</Label>
      <ContrastSegmentedButton>
        {CONTRAST_THEMES.map((contrast) => (
          <Button
            key={contrast}
            data-contrast={contrast}
            onPress={() => setUserSettings({ contrastTheme: contrast })}
            primary={userSettings.contrastTheme === contrast}
            data-selected={userSettings.contrastTheme === contrast}
          >
            <span>{contrast}</span>
          </Button>
        ))}
      </ContrastSegmentedButton>
    </p>
  );
}
