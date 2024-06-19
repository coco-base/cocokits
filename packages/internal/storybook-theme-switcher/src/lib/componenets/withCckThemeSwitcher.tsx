import { addons, useEffect } from '@storybook/preview-api';
import { PartialStoryFn as StoryFunction, Renderer } from '@storybook/types';
import _ from 'lodash';

import {
  CCK_THEME_CHANGED_EVENT_NAME,
  CCK_THEME_DOCUMENT_ATTR,
  CckThemeChangedEvent,
  DEFAULT_SELECTED_CCK_THEME_MODES,
  DEFAULT_SELECTED_CCK_THEME_NAME,
} from '@coco-kits/storybook-theme-switcher';

import { generateCckThemeChangeEventData, getSelectedCckTheme } from './theme-switcher.utils';


export const withCckThemeSwitcher = (StoryFn: StoryFunction<Renderer>) => {

  const setSelectedCckTheme = ({ name, selectedModes }: CckThemeChangedEvent) => {
    // Default theme has already added to the Dom from DocPage (packages/internal/storybook-theme-switcher/src/assets/storybook-theme-switcher-token.css)
    // We have to just remove the old selected cck-theme.
    if(name === 'Default') {
      document.documentElement.removeAttribute(CCK_THEME_DOCUMENT_ATTR);
      return;
    }

    const kebabCaseName = _.kebabCase(name);
    const attr = Object.entries(selectedModes).map(([collectionName, mode]) => `${kebabCaseName}__${collectionName}--${mode}`).join(' ');
    document.documentElement.setAttribute(CCK_THEME_DOCUMENT_ATTR, attr);
  };

  addons.getChannel().on(CCK_THEME_CHANGED_EVENT_NAME, setSelectedCckTheme);

  useEffect(() => {
    const lastCckTheme = getSelectedCckTheme();

    const cckTheme = lastCckTheme ?? generateCckThemeChangeEventData({
      name: DEFAULT_SELECTED_CCK_THEME_NAME,
      selectedModes: DEFAULT_SELECTED_CCK_THEME_MODES
    });

    setSelectedCckTheme(cckTheme);
  }, []);

  return StoryFn();
};
