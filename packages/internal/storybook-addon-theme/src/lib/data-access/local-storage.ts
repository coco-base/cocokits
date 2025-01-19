import { DEFAULT_COLOR_MODE, DEFAULT_THEME_ID, DEFAULT_THEME_MODES, THEMES } from '../config/addon-theme.config';
import { ColorModeChangeEvent } from '../model/event.model';
import { ColorMode, SelectedTheme, ThemeId } from '../model/theme.model';

const LOCAL_STORAGE_SELECTED_COLOR_MODE_KEY = 'cocokits_color-mode';
const LOCAL_STORAGE_SELECTED_THEME_KEY = 'cocokits_theme';

export class LocalStorage {
  // #region COLOR_MODE
  public setColorMode(event: ColorModeChangeEvent) {
    window.localStorage.setItem(LOCAL_STORAGE_SELECTED_COLOR_MODE_KEY, event.colorMode);
  }

  public getColorMode(): ColorMode | null {
    const localStorageColorMode = window.localStorage.getItem(LOCAL_STORAGE_SELECTED_COLOR_MODE_KEY) as ColorMode;
    const isValid = this.validateColorMode(localStorageColorMode);

    return isValid ? localStorageColorMode : null;
  }

  public getColorModeOrDefault(): ColorMode {
    return this.getColorMode() ?? DEFAULT_COLOR_MODE;
  }

  private validateColorMode(colorMode: ColorMode): boolean {
    return Object.values(ColorMode).includes(colorMode);
  }

  // #endregion

  // #region THEME
  public setTheme(event: SelectedTheme) {
    window.localStorage.setItem(LOCAL_STORAGE_SELECTED_THEME_KEY, JSON.stringify(event));
  }

  public getTheme(): SelectedTheme | null {
    try {
      const localStorageColorMode = JSON.parse(
        window.localStorage.getItem(LOCAL_STORAGE_SELECTED_THEME_KEY) ?? ''
      ) as SelectedTheme;
      const isValid = this.validateSelectedTheme(localStorageColorMode);

      return isValid ? localStorageColorMode : null;
    } catch (error) {
      console.log('Can not find or validate the CocoKits theme from local storage.', error);
      return null;
    }
  }

  public getThemeOrDefault(): SelectedTheme {
    return (
      this.getTheme() ?? {
        id: DEFAULT_THEME_ID,
        selectedModes: DEFAULT_THEME_MODES,
      }
    );
  }

  private validateSelectedTheme({ id, selectedModes }: SelectedTheme): boolean {
    const isIdValid = Object.values(ThemeId).includes(id);

    if (!isIdValid) {
      return false;
    }

    const originalCollectionModeNames = THEMES[id].tokenDictionary.collectionModeNames;

    if (Object.keys(originalCollectionModeNames).length !== Object.keys(selectedModes).length) {
      return false;
    }

    const isSelectedModesValid = Object.entries(selectedModes).every(([collection, mode]) => {
      return originalCollectionModeNames[collection].map((modeNames) => modeNames.name).includes(mode);
    });

    return isSelectedModesValid;
  }

  // #endregion
}

// export const LocalStorage = new _LocalStorage();
