import type { ThemeSvgIcon, ThemeUIComponentsConfig } from '@cocokits/core';

export type CckThemeName = 'Default' | 'FrameX';
export type CckThemeId = 'default' | 'frame-x';

export interface CckTheme {
  id: CckThemeId;
  name: CckThemeName;
  description: string;
  iconPathLight: string;
  iconPathDark: string;
  collections: Record<string, string[]>;
  defaultSelectedModes: Record<string, string>;
  uiComponentConfig: ThemeUIComponentsConfig;
  svgIconMap: Record<string, ThemeSvgIcon>;
}

export interface CckThemeChangedEvent {
  id: CckThemeId;
  name: CckThemeName;
  iconPathLight: string;
  iconPathDark: string;
  selectedModes: Record<string, string>;
  uiComponentConfig: ThemeUIComponentsConfig;
  svgIconMap: Record<string, ThemeSvgIcon>;
}

export interface CckSelectedTheme {
  id: CckThemeId;
  selectedModes: Record<string, string>;
}

export type CckThemeLocalstorage = CckSelectedTheme;
