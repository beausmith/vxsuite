import React from 'react';
import styled from 'styled-components';

import { Button, SegmentedButton } from '@votingworks/ui';

import { SetUserSettings, UserSettings } from '../config/types';
import { SIZE_THEMES, TEXT_SIZES } from '../config/globals';

const TextSizeSegmentedButton = styled(SegmentedButton)`
  button {
    min-width: ${TEXT_SIZES[1] * 3.5}px;
    /* stylelint-disable declaration-no-important */
    &[data-size='S'] {
      font-size: ${TEXT_SIZES[0]}px !important;
    }
    &[data-size='M'] {
      font-size: ${TEXT_SIZES[1]}px !important;
    }
    &[data-size='L'] {
      font-size: ${TEXT_SIZES[2]}px !important;
    }
    &[data-size='XL'] {
      font-size: ${TEXT_SIZES[3]}px !important;
    }
    /* stylelint-enable */
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

const ariaLabels = ['Small', 'Medium', 'Large', 'Extra Large'];

export function SettingsTextSize({
  userSettings,
  setUserSettings,
}: Props): JSX.Element {
  return (
    <p>
      <Label aria-hidden>Text Size</Label>
      <TextSizeSegmentedButton data-testid="change-text-size-buttons">
        {SIZE_THEMES.map((v, i) => (
          <Button
            key={v}
            data-size={v}
            onPress={() => setUserSettings({ sizeTheme: v })}
            value={v}
            primary={userSettings.sizeTheme === v}
            aria-label={`${
              userSettings.sizeTheme === v ? 'Selected' : ''
            } Text Size: ${ariaLabels[i]}`}
          >
            A
          </Button>
        ))}
      </TextSizeSegmentedButton>
    </p>
  );
}
