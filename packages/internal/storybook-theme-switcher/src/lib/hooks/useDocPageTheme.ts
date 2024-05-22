import { Globals } from '@storybook/types';
import { addons } from '@storybook/preview-api';
import { GLOBALS_UPDATED, UPDATE_GLOBALS } from '@storybook/core-events';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME, GLOBAL_THEME_ID, THEMES } from '../config/constants';
import { findThemeByIdOrDefault } from '../utils/find-theme';

/**
 * Hook that should be used only after Storybook initialization (When preview API is available).
 * It is designed for use within component stories or documentation pages.
 * Note that this hook cannot be utilized during the manager build process of Storybook.
 */
export const useDocPageTheme = () => {
  const initSelectedThemeId = getInitSelectedThemeId();
  const [selectedThemeId, setSelectedThemeId] = useState<string>(initSelectedThemeId);

  useEffect(() => {
    const onGlobalsUpdated = (changed: { globals: Globals }) => {
      const selectedId: string = changed.globals[GLOBAL_THEME_ID];
      setSelectedThemeId(selectedId);
    };
    addons.getChannel().on(GLOBALS_UPDATED, onGlobalsUpdated);

    return () => {
      addons.getChannel().off(GLOBALS_UPDATED, onGlobalsUpdated);
    };
  }, [selectedThemeId]);

  const selectedTheme = useMemo(() => {
    return findThemeByIdOrDefault(selectedThemeId);
  }, [selectedThemeId]);

  const updateTheme = (themeId: string) => {
    addons.getChannel().emit(UPDATE_GLOBALS, { globals: { [GLOBAL_THEME_ID]: themeId } });
  };

  return { selectedTheme, updateTheme, themes: THEMES };
};

function getInitSelectedThemeId() {
  const lastGlobalChanges = addons.getChannel().last(GLOBALS_UPDATED) as { globals?: Globals }[];
  const lastGlobal = lastGlobalChanges?.[0].globals;

  return lastGlobal?.[GLOBAL_THEME_ID] ?? window.localStorage.getItem(GLOBAL_THEME_ID) ?? DEFAULT_THEME.id;
}
