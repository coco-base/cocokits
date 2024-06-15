import type { ThemeSvgIcon } from '@coco-kits/common-types';

export type CckThemeName = 'Default' | 'FrameX' | 'Theme2';

export interface CckTheme {
  name: CckThemeName;
  iconPath: string;
  collections: Record<string, string[]>;
}

export interface CckThemeChangedEvent {
  name: CckThemeName;
  iconPath: string;
  iconList: Record<string, ThemeSvgIcon>;
  selectedModes: Record<string, string>;
}

export interface CckThemeLocalstorage {
  name: CckThemeName;
  selectedModes: Record<string, string>;
}
