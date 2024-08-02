import type { ThemeSvgIcon, ThemeUIComponentsConfig } from '@cocokits/core';
import { TokenDictionary } from '@cocokits/workspace-plugin';

export type CckThemeName = 'Default' | 'FrameX';
export type CckThemeId = 'default' | 'frame-x';

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

export type CckThemeLocalstorage = CckSelectedTheme;
