import React from 'react';
import { render } from '@testing-library/react';

import { ThemeProvider } from 'styled-components';
import { Screen } from './screen';
import { contrastThemes } from './themes/contrast';
import { extraLargeSizeTheme } from './themes/size';

describe('renders Screen', () => {
  test('with defaults', () => {
    const { container } = render(<Screen>Screen</Screen>);
    const screen = container.firstChild;
    // critical styles
    expect(screen).toHaveStyleRule('height', '100%');
    expect(screen).toHaveStyleRule('display', 'none', {
      media: 'print',
    });
    // variable styles
    expect(screen).toHaveStyleRule('flex-direction', 'column');
    expect(screen).toHaveStyleRule('background-color', '#ffffff');
    expect(screen).toHaveStyleRule('color', '#000000');
    expect(screen).toHaveStyleRule('font-size', '39px');
  });

  test('with white contrast theme', () => {
    const { container } = render(
      <ThemeProvider
        theme={{
          size: extraLargeSizeTheme,
          contrast: contrastThemes['white'],
        }}
      >
        <Screen>Screen</Screen>
      </ThemeProvider>
    );
    const screen = container.firstChild;
    expect(screen).toHaveStyleRule('background-color', '#000000');
    expect(screen).toHaveStyleRule('font-size', '66px');
  });

  test('with right nav', () => {
    const { container } = render(<Screen navRight>Screen</Screen>);
    const screen = container.firstChild;
    expect(screen).toHaveStyleRule('flex-direction', 'row');
  });
});
