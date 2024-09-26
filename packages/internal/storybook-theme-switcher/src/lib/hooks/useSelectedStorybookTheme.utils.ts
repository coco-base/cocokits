import { addons } from '@storybook/preview-api';

import { getSelectedStorybookTheme } from '../components/theme-switcher.utils';
import { STORYBOOK_THEME_CHANGED_EVENT_NAME } from '../config/storybook-theme.config';
import { StorybookThemeChangedEvent, StorybookThemeName } from '../config/storybook-theme.model';

interface UseSelectedStorybookThemeProps {
  useState:
    | (<S>(initialState: S | (() => S)) => [S, (update: S | ((prevState: S) => S)) => void])
    | (<S>(initialState?: S | (() => S)) => [S, (update: S | ((prevState: S) => S)) => void]);
  useEffect: (create: () => (() => void) | void, deps?: any[]) => void;
}

export function useSelectedStorybookTheme({ useState, useEffect }: UseSelectedStorybookThemeProps) {
  const [selectedStorybookTheme, setSelectedStorybookTheme] = useState<StorybookThemeName>('dark');

  const channel = addons.getChannel();
  channel.on(STORYBOOK_THEME_CHANGED_EVENT_NAME, ({ themeName }: StorybookThemeChangedEvent) => {
    setSelectedStorybookTheme(themeName);
  });

  useEffect(() => {
    const lastSelectedTheme = getSelectedStorybookTheme();
    setSelectedStorybookTheme(lastSelectedTheme);
  }, []);

  return selectedStorybookTheme;
}
