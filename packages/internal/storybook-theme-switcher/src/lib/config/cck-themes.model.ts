import type { ThemeSvgIcon } from '@coco-kits/common-types';

export type CckThemeName = 'Default' | 'FrameX' | 'Theme2';

export interface CckTheme {
  name: CckThemeName;
  iconPathLight: string;
  iconPathDark: string;
  collections: Record<string, string[]>;
}

export interface CckThemeChangedEvent {
  name: CckThemeName;
  iconPathLight: string;
  iconPathDark: string;
  iconList: Record<string, ThemeSvgIcon>;
  selectedModes: Record<string, string>;
}

export interface CckSelectedTheme {
  name: CckThemeName;
  selectedModes: Record<string, string>;
}

export type CckThemeLocalstorage = CckSelectedTheme;
