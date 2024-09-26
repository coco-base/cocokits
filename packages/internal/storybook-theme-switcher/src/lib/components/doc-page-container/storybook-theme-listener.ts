import { DocsContextProps } from '@storybook/types';
import { STORYBOOK_THEME_CHANGED_EVENT_NAME, StorybookThemeChangedEvent } from '@cocokits/storybook-theme-switcher';
import { getSelectedStorybookTheme } from '../theme-switcher.utils';

export function storybookThemeListener(context: DocsContextProps) {
  document.documentElement.classList.add(`cck-storybook`);

  const setSelectedStorybookTheme = ({ themeName }: StorybookThemeChangedEvent) => {
    document.documentElement.classList.remove('cck-storybook-dark-theme', 'cck-storybook-light-theme');
    document.documentElement.classList.add(`cck-storybook-${themeName}-theme`);
  };

  context.channel.on(STORYBOOK_THEME_CHANGED_EVENT_NAME, setSelectedStorybookTheme);

  const lastStorybookTheme = getSelectedStorybookTheme();
  setSelectedStorybookTheme({ themeName: lastStorybookTheme });
}
