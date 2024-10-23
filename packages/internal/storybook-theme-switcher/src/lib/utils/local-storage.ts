import {
  DEFAULT_STORYBOOK_THEME_NAME,
  LOCAL_STORAGE_STORYBOOK_THEME,
  STORYBOOK_THEME_NAME_LIST,
  StorybookThemeName,
} from '@cocokits/storybook-theme-switcher';

import {
  CCK_THEMES_MAP,
  DEFAULT_SELECTED_CCK_THEME_ID,
  DEFAULT_SELECTED_CCK_THEME_MODES,
  LOCAL_STORAGE_CCK_THEME,
} from '../config/cck-theme.config';
import { CCK_THEME_IDS_LIST, CckSelectedTheme, CckThemeLocalStorage } from '../config/cck-themes.model';

export class LocalStorage {
  public static getCckTheme(): CckThemeLocalStorage | null {
    const localStorageThemeStr = window.localStorage.getItem(LOCAL_STORAGE_CCK_THEME);
    const localStorageTheme = localStorageThemeStr ? JSON.parse(localStorageThemeStr) : null;
    const isValid = LocalStorage.validateCckTheme(localStorageTheme);

    return isValid ? localStorageTheme : null;
  }

  public static getCckThemeOrDefault(): CckThemeLocalStorage {
    const localStorageThemeStr = window.localStorage.getItem(LOCAL_STORAGE_CCK_THEME);
    const localStorageTheme: CckThemeLocalStorage = localStorageThemeStr ? JSON.parse(localStorageThemeStr) : {};
    const isValid = LocalStorage.validateCckTheme(localStorageTheme);

    if (isValid) {
      return localStorageTheme;
    }

    return {
      id: DEFAULT_SELECTED_CCK_THEME_ID,
      selectedModes: DEFAULT_SELECTED_CCK_THEME_MODES,
    };
  }

  public static setCckTheme({ id, selectedModes }: CckSelectedTheme) {
    const value: CckThemeLocalStorage = { id, selectedModes };
    window.localStorage.setItem(LOCAL_STORAGE_CCK_THEME, JSON.stringify(value));
  }

  public static getStorybookThemeOrDefault(): StorybookThemeName {
    const localStorageThemeStr = window.localStorage.getItem(LOCAL_STORAGE_STORYBOOK_THEME) as StorybookThemeName;
    const isValid = STORYBOOK_THEME_NAME_LIST.includes(localStorageThemeStr);

    return isValid ? localStorageThemeStr : DEFAULT_STORYBOOK_THEME_NAME;
  }

  public static setStorybookTheme(themeName: StorybookThemeName) {
    window.localStorage.setItem(LOCAL_STORAGE_STORYBOOK_THEME, themeName);
  }

  private static validateCckTheme(localStorageTheme: CckThemeLocalStorage): boolean {
    const isIdValid = CCK_THEME_IDS_LIST.includes(localStorageTheme.id);

    if (!isIdValid) {
      return false;
    }

    const originalCollectionModeNames = CCK_THEMES_MAP[localStorageTheme.id].tokenDictionary.collectionModeNames;

    if (Object.keys(originalCollectionModeNames).length !== Object.keys(localStorageTheme.selectedModes).length) {
      return false;
    }

    const isSelectedModesValid = Object.entries(localStorageTheme.selectedModes).every(([collection, mode]) => {
      return originalCollectionModeNames[collection].map((modeNames) => modeNames.name).includes(mode);
    });

    return isSelectedModesValid;
  }
}
