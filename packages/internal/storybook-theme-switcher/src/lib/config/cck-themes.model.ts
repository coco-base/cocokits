import type { ThemeSvgIcon } from '@coco-kits/common-types';

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
}

export interface CckThemeChangedEvent {
  id: CckThemeId;
  name: CckThemeName;
  iconPathLight: string;
  iconPathDark: string;
  iconList: Record<string, ThemeSvgIcon>;
  selectedModes: Record<string, string>;
}

export interface CckSelectedTheme {
  id: CckThemeId;
  selectedModes: Record<string, string>;
}

export type CckThemeLocalstorage = CckSelectedTheme;
