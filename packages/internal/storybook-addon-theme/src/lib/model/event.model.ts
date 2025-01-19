import { ColorMode, SelectedTheme, Theme } from './theme.model';

export type ThemeChangeEvent = Theme & SelectedTheme;

export interface ColorModeChangeEvent {
  colorMode: ColorMode;
}
