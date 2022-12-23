import { SizeTheme, ContrastTheme } from '@votingworks/types';
import { defaultContrastTheme } from './contrast';
import { defaultSizeTheme } from './size';

export interface Theme {
  size: SizeTheme;
  contrast: ContrastTheme;
}

export const defaultTheme: Theme = {
  size: defaultSizeTheme,
  contrast: defaultContrastTheme,
};
