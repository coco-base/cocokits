import { CckThemeLocalStorage } from '../config/cck-themes.model';

export enum StorybookPageCategories {
  GettingStarted = 'Getting Started',
  UIComponents = 'UI Components',
  ThemeConfig = 'Theme Config',
  CDK = 'CDK',
  Utils = 'Utils',
  Unknown = 'Unknown',
}

export enum MixpanelEvents {
  Start = 'Start',
  PageChange = 'Page Change',
  CckThemeChange = 'Cck Theme Changed',
}

export type MixpanelEventData<T extends MixpanelEvents> = T extends MixpanelEvents.Start
  ? MixPanelStartData
  : T extends MixpanelEvents.PageChange
  ? MixpanelPageChangeData
  : T extends MixpanelEvents.CckThemeChange
  ? MixPanelCckThemeChangeData
  : never;

export interface MixpanelPageChangeData {
  pageName: string;
  theme: CckThemeLocalStorage;
  category: StorybookPageCategories;
}

export interface MixPanelStartData {
  theme: CckThemeLocalStorage | null;
}

export interface MixPanelCckThemeChangeData {
  pageName: string;
  theme: CckThemeLocalStorage;
}

export interface MixPanelStorybookThemeChangeData {
  pageName: string;
  theme: CckThemeLocalStorage;
  storybookTheme: string;
}
