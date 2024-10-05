import {
  DEFAULT_STORYBOOK_THEME_NAME,
  LOCALSTORAGE_STORYBOOK_THEME,
  STORYBOOK_THEME_NAME_LIST,
  StorybookThemeName,
} from '@cocokits/storybook-theme-switcher';

import {
  CCK_THEMES_MAP,
  DEFAULT_SELECTED_CCK_THEME_ID,
  DEFAULT_SELECTED_CCK_THEME_MODES,
  LOCALSTORAGE_CCK_THEME,
} from '../config/cck-theme.config';
import { CCK_THEME_IDS_LIST, CckSelectedTheme, CckThemeLocalstorage } from '../config/cck-themes.model';

export class LocalStorage {
  public static getCckThemeOrDefault(): CckThemeLocalstorage {
    const localstorageThemeStr = window.localStorage.getItem(LOCALSTORAGE_CCK_THEME);
    const localstorageTheme: CckThemeLocalstorage = localstorageThemeStr ? JSON.parse(localstorageThemeStr) : {};
    const isValid = LocalStorage.validateCckTheme(localstorageTheme);

    if (isValid) {
      return localstorageTheme;
    }

    return {
      id: DEFAULT_SELECTED_CCK_THEME_ID,
      selectedModes: DEFAULT_SELECTED_CCK_THEME_MODES,
    };
  }

  public static setCckTheme({ id, selectedModes }: CckSelectedTheme) {
    const value: CckThemeLocalstorage = { id, selectedModes };
    window.localStorage.setItem(LOCALSTORAGE_CCK_THEME, JSON.stringify(value));
  }

  public static getStorybookThemeOrDefault(): StorybookThemeName {
    const localstorageThemeStr = window.localStorage.getItem(LOCALSTORAGE_STORYBOOK_THEME) as StorybookThemeName;
    const isValid = STORYBOOK_THEME_NAME_LIST.includes(localstorageThemeStr);

    return isValid ? localstorageThemeStr : DEFAULT_STORYBOOK_THEME_NAME;
  }

  public static setStorybookTheme(themeName: StorybookThemeName) {
    window.localStorage.setItem(LOCALSTORAGE_STORYBOOK_THEME, themeName);
  }

  private static validateCckTheme(localstorageTheme: CckThemeLocalstorage): boolean {
    const isIdValid = CCK_THEME_IDS_LIST.includes(localstorageTheme.id);

    if (!isIdValid) {
      return false;
    }

    const originalCollectionModeNames = CCK_THEMES_MAP[localstorageTheme.id].tokenDictionary.collectionModeNames;

    if (Object.keys(originalCollectionModeNames).length !== Object.keys(localstorageTheme.selectedModes).length) {
      return false;
    }

    const isSelectedModesValid = Object.entries(localstorageTheme.selectedModes).every(([collection, mode]) => {
      return originalCollectionModeNames[collection].map((modeNames) => modeNames.name).includes(mode);
    });

    return isSelectedModesValid;
  }
}
