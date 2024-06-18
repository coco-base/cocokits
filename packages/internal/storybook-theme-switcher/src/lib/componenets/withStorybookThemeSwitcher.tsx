import { addons, useEffect } from '@storybook/preview-api';
import { PartialStoryFn as StoryFunction, Renderer } from '@storybook/types';

import { STORYBOOK_THEME_CHANGED_EVENT_NAME, StorybookThemeChangedEvent } from '@coco-kits/storybook-theme-switcher';

import { getSelectedStorybookTheme } from './theme-switcher.utils';


export const withStorybookThemeSwitcher = (StoryFn: StoryFunction<Renderer>) => {

  const setSelectedStorybookTheme = ({ themeName }: StorybookThemeChangedEvent) => {
    document.documentElement.classList.remove('cck-storybook-dark-theme', 'cck-storybook-light-theme');
    document.documentElement.classList.add(`cck-storybook-${themeName}-theme`);
  };

  addons.getChannel().on(STORYBOOK_THEME_CHANGED_EVENT_NAME, setSelectedStorybookTheme);

  useEffect(() => {
    const lastStorybookTheme = getSelectedStorybookTheme();
    setSelectedStorybookTheme({themeName: lastStorybookTheme});
  }, []);

  return StoryFn();
};
