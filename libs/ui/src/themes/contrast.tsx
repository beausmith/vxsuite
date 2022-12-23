import { ContrastSetting } from '@votingworks/types';

interface ContrastTheme {
  foreground: string;
  background: string;
}

export const contrastThemes: Record<ContrastSetting, ContrastTheme> = {
  black: {
    foreground: '#000000',
    background: '#ffffff',
  },
  white: {
    foreground: '#ffffff',
    background: '#000000',
  },
  grey: {
    foreground: '#ffffff',
    background: '#696969',
  },
};
export const defaultContrastTheme = contrastThemes['black'];
// const contrastThemeKeys = Object.keys(contrastThemes) as ContrastSetting[];
