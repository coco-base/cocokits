import { ThemeConfig, TokenDictionary } from '@cocokits/core';

// #region COLOR MODE
export enum ColorMode {
  Light = 'light',
  Dark = 'dark',
}

// #endregion

// #region THEME SWITCHER
export enum ThemeId {
  CocoKits = 'cocokits',
  FramesX = 'frames-x',
}

export interface Theme {
  id: ThemeId;
  displayName: string;
  description: string;
  tokenDictionary: TokenDictionary;
  themeConfig: ThemeConfig;

  defaultSelectedModes: Record<string, string>;
  iconPaths: Record<ColorMode, string>;

  /**
   * Handles the theme switch in Storybook by updating the CCK theme mode.
   *
   * When the Storybook theme changes between color modes,
   * the corresponding CCK theme ('light' or 'dark') must also be updated.
   * This ensures that the Storybook documentation pages display the correct colors.
   *
   * Example:
   * If the Storybook theme changes from 'light' to 'dark', update the CCK theme to 'dark'
   * to maintain color consistency across the documentation.
   *
   * ```ts
   *  colorModeTokenMode: {
   *   [ColorMode.Light]: { 'color-mode': 'light' },
   *   [ColorMode.Dark]: { 'color-mode': 'dark' },
   * }
   * ``
   */
  colorModeTokenCollectionMode: Record<ColorMode, Record<string, string>>;
}

export interface SelectedTheme {
  id: ThemeId;
  selectedModes: Record<string, string>;
}

// #endregion
