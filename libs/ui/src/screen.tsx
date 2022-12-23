import styled from 'styled-components';
import { defaultTheme } from './themes/default';
import { cssFontSizePixels } from './themes/size';

interface Props {
  navRight?: boolean;
}

// The Screen component:
// - defines the foundational layout of the screen (flex-direction).
// - defines the base font-size of the page.
// - defined the background color and text color.

export const Screen = styled.div<Props>`
  display: flex;
  flex-direction: ${({ navRight }) => (navRight && 'row') || 'column'};
  background-color: ${({ theme }) => theme.contrast.background};
  height: 100%;
  overflow: auto;
  line-height: 1;
  color: ${({ theme }) => theme.contrast.foreground};
  font-size: ${({ theme }) => cssFontSizePixels(theme.size.text)}px;
  @media print {
    display: none;
  }
`;

Screen.defaultProps = {
  theme: defaultTheme,
};
