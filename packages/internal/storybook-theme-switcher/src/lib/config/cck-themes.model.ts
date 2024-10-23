import type { ThemeSvgIcon, ThemeUIComponentsConfig, TokenDictionary } from '@cocokits/core';

export type CckThemeName = 'Cocokits' | 'Frames X';
export type CckThemeId = 'cocokits' | 'frames-x';

export const CCK_THEME_IDS_LIST = ['cocokits', 'frames-x'] as const;

export interface CckTheme {
  id: CckThemeId;
  name: CckThemeName;
  description: string;
  iconPathLight: string;
  iconPathDark: string;
  tokenDictionary: TokenDictionary;
  defaultSelectedModes: Record<string, string>;
  uiComponentConfig: ThemeUIComponentsConfig;
  svgIconMap: Record<string, ThemeSvgIcon>;

  /**
   * Handles the theme switch in Storybook by updating the CCK theme mode.
   *
   * When the Storybook theme changes between 'light' and 'dark',
   * the corresponding CCK theme ('light' or 'dark') must also be updated.
   * This ensures that the Storybook documentation pages display the correct colors.
   *
   * Example:
   * If the Storybook theme changes from 'light' to 'dark', update the CCK theme to 'dark'
   * to maintain color consistency across the documentation.
   */
  lightCollectionModes: Record<string, string>; // { color-mode: 'light' }
  darkCollectionModes: Record<string, string>; // { color-mode: 'dark' }
}

export interface CckThemeChangedEvent {
  id: CckThemeId;
  name: CckThemeName;
  iconPathLight: string;
  iconPathDark: string;
  tokenDictionary: TokenDictionary;
  selectedModes: Record<string, string>;
  uiComponentConfig: ThemeUIComponentsConfig;
  svgIconMap: Record<string, ThemeSvgIcon>;
}

export interface CckSelectedTheme {
  id: CckThemeId;
  selectedModes: Record<string, string>;
}

export type CckThemeLocalStorage = CckSelectedTheme;
