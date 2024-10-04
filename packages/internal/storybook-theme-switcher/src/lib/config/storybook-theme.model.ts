export interface StorybookThemeChangedEvent {
  themeName: StorybookThemeName;
}

export type StorybookThemeName = 'light' | 'dark';
export const STORYBOOK_THEME_NAME_LIST = ['light', 'dark'] as const;
