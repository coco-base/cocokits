import { DEFAULT_THEME, GLOBAL_THEME_KEY, GlobalArgs, Theme, THEMES } from '../config/constants';
import { useGlobals } from '@storybook/manager-api';
import { useMemo } from 'react';

export const useTheme = () => {
  const [{ [GLOBAL_THEME_KEY]: selectedId }, updateGlobal] = useGlobals() as unknown as [
    GlobalArgs,
    (newGlobals: GlobalArgs) => void
  ];

  const selectedTheme = useMemo(() => {
    return THEMES.find((theme) => theme.id === selectedId) ?? DEFAULT_THEME;
  }, [selectedId]);

  const updateTheme = (theme: Theme) => {
    updateGlobal({ [GLOBAL_THEME_KEY]: theme.id });
  };

  return { selectedTheme, updateTheme };
};
