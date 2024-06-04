import { useGlobals, useMemo } from '@storybook/preview-api';

import { GLOBAL_THEME_ID, GlobalArgs, THEMES } from '../config/constants';
import { findThemeByIdOrDefault } from '../utils/find-theme';

export const usePreviewTheme = () => {
  const [{ [GLOBAL_THEME_ID]: selectedThemeId }, updateGlobal] = useGlobals() as unknown as [
    GlobalArgs,
    (newGlobals: GlobalArgs) => void
  ];

  const selectedTheme = useMemo(() => {
    return findThemeByIdOrDefault(selectedThemeId);
  }, [selectedThemeId]);

  const updateTheme = (themeId: string) => {
    updateGlobal({ [GLOBAL_THEME_ID]: themeId });
  };

  return { selectedTheme, updateTheme, themes: THEMES };
};