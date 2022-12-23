import { DefinedDictionary, SizeSetting, SizeTheme } from '@votingworks/types';

export const sizeThemes: DefinedDictionary<SizeTheme> = {
  S: {
    label: 'Small',
    text: 10,
    lineHeight: 1.4,
    h1: 1.35,
    h2: 1.15,
    h3: 1,
    h4: 0.8,
  },
  M: {
    label: 'Medium',
    text: 14,
    lineHeight: 1.4,
    h1: 1.35,
    h2: 1.15,
    h3: 1,
    h4: 0.8,
  },
  L: {
    label: 'Large',
    text: 18,
    lineHeight: 1.4,
    h1: 1.2,
    h2: 1.1,
    h3: 1,
    h4: 0.8,
  },
  XL: {
    label: 'Extra Large',
    text: 24,
    lineHeight: 1.2,
    h1: 1.2,
    h2: 1.1,
    h3: 1,
    h4: 0.8,
  },
};
export const sizeThemeKeys = Object.keys(sizeThemes) as SizeSetting[];
export const defaultSizeTheme = sizeThemes['M'];
export const extraLargeSizeTheme = sizeThemes['XL'];

const defaultPixelScreen: DefinedDictionary<number> = {
  // Default to Elo screen (1920 x 1080 FHD) for jest as it's screen is 0 x 0.
  // Could use the following in every test, but it would be redundant:
  //   jest.spyOn(window.screen, "width", "get").mockReturnValue(1080);
  //   jest.spyOn(window.screen, "height", "get").mockReturnValue(1920);
  width: window.screen.width || 1080,
  height: window.screen.height || 1920,
};

export const defaultPhysicalScreen: DefinedDictionary<number> = {
  // Elo 13" (E683595) 11.57" x 6.5"  (165.946413137424373ppi) = 166ppi
  // width: 6.5,
  // height: 11.57,
  // Elo 15" (E155645) 13.55" x 7.62" (141.697416974169742ppi) = 142ppi
  width: 7.62,
  height: 13.55,
};

export function screenPixelsPerInch(
  physical = defaultPhysicalScreen,
  pixel = defaultPixelScreen
): number {
  return Math.round(
    Math.hypot(pixel['width'], pixel['height']) /
      Math.hypot(physical['width'], physical['height'])
  );
}

export function cssFontSizePixels(points: number): number {
  return Math.round((screenPixelsPerInch() / 72) * points * 1.4); // 1.4 is a magic number to increase the font-size such that they letter "I" is the specified height in points.
}

export const cssFontSizeMinPixels = `${cssFontSizePixels(
  sizeThemes['S']['text']
)}px`;

export function screenInchesToPixels(
  inches: number,
  units = true,
  ppi = screenPixelsPerInch()
): number | string {
  const pixels = Math.round(ppi * inches);
  return units ? `${pixels}px` : pixels;
}
