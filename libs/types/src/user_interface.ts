import * as z from 'zod';

export type SizeSetting = 'S' | 'M' | 'L' | 'XL';
export const SizeSettingSchema: z.ZodSchema<SizeSetting> = z.union([
  z.literal('S'),
  z.literal('M'),
  z.literal('L'),
  z.literal('XL'),
]);

export type SizeSettingLabel = 'Small' | 'Medium' | 'Large' | 'Extra Large';
export const SizeSettingLabelSchema: z.ZodSchema<SizeSettingLabel> = z.union([
  z.literal('Small'),
  z.literal('Medium'),
  z.literal('Large'),
  z.literal('Extra Large'),
]);

export interface SizeTheme {
  readonly label: SizeSettingLabel;
  readonly text: number; // points
  readonly lineHeight: number; // unitless value multiplier
  readonly h1: number; // em
  readonly h2: number; // em
  readonly h3: number; // em
  readonly h4: number; // em
}
export const SizeThemeSchema: z.ZodSchema<SizeTheme> = z.object({
  label: SizeSettingLabelSchema,
  text: z.number(),
  lineHeight: z.number(),
  h1: z.number(),
  h2: z.number(),
  h3: z.number(),
  h4: z.number(),
});

export type ContrastSetting = 'black' | 'white' | 'grey';
export const ContrastSchema: z.ZodSchema<ContrastSetting> = z.union([
  z.literal('black'),
  z.literal('white'),
  z.literal('grey'),
]);

export interface ContrastTheme {
  readonly foreground: string; // color
  readonly background: string; // color
}
export const ContratThemeSchema: z.ZodSchema<ContrastTheme> = z.object({
  foreground: z.string(),
  background: z.string(),
});
