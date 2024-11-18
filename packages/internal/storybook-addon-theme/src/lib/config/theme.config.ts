import { framesXThemeConfig, tokenDictionary as tokenDictionaryFramesXTheme } from '@cocokits/theme-frames-x';
import { cocokitsThemeConfig, tokenDictionary as tokenDictionaryCocokitsTheme } from '@cocokits/theme-cocokits';

import { ColorMode, Theme, ThemeId } from '../model/theme.model';
import { getCollectionFirstModeNames } from '../utils/token.util';

const THEME_COCOKITS: Theme = {
  id: ThemeId.CocoKits,
  displayName: 'CocoKits',
  description:
    'This is the Cocokits theme for the library, designed by the CocoKits team to provide a balanced and consistent look for all components, ensuring a smooth and cohesive user experience.',
  tokenDictionary: tokenDictionaryCocokitsTheme,
  themeConfig: cocokitsThemeConfig,
  defaultSelectedModes: {
    ...getCollectionFirstModeNames(tokenDictionaryCocokitsTheme),
    'brand-color-1': 'dark',
  },
  iconPaths: {
    [ColorMode.Light]: '/cocokits-icon-dark.svg',
    [ColorMode.Dark]: '/cocokits-icon-light.svg',
  },
  colorModeTokenCollectionMode: {
    [ColorMode.Light]: { 'brand-color-1': 'light' },
    [ColorMode.Dark]: { 'brand-color-1': 'dark' },
  },
};

const THEME_FRAMES_X: Theme = {
  id: ThemeId.FramesX,
  displayName: 'Frames X',
  description:
    'Frames X is the largest web design system in the world. With un-styled UI components and support for multiple color and brand themes.',
  themeConfig: framesXThemeConfig,
  tokenDictionary: tokenDictionaryFramesXTheme,
  defaultSelectedModes: {
    ...getCollectionFirstModeNames(tokenDictionaryFramesXTheme),
    'color-mode': 'dark',
  },
  iconPaths: {
    [ColorMode.Light]: '/framesX-logo-dark.svg',
    [ColorMode.Dark]: '/framesX-logo-light.svg',
  },
  colorModeTokenCollectionMode: {
    [ColorMode.Light]: { 'color-mode': 'light' },
    [ColorMode.Dark]: { 'color-mode': 'dark' },
  },
};

export const THEMES: Record<ThemeId, Theme> = {
  [ThemeId.CocoKits]: THEME_COCOKITS,
  [ThemeId.FramesX]: THEME_FRAMES_X,
};

export const DEFAULT_THEME_ID = ThemeId.FramesX;
export const DEFAULT_THEME_MODES = THEMES[DEFAULT_THEME_ID].defaultSelectedModes;
export const DEFAULT_COLOR_MODE = ColorMode.Dark;
