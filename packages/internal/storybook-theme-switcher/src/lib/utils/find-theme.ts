import { DEFAULT_THEME, THEMES } from '../config/constants';

export function findThemeByIdOrDefault(themeId?: string | null) {
  return THEMES.find((theme) => theme.id === themeId) ?? DEFAULT_THEME;
}
