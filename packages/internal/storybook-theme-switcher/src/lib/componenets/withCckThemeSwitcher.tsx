import { addons, useEffect } from '@storybook/preview-api';
import { PartialStoryFn as StoryFunction, Renderer } from '@storybook/types';

import {
  CCK_THEME_CHANGED_EVENT_NAME,
  CCK_THEME_DOCUMENT_ATTR, CCK_THEME_NAME_DOCUMENT_ATTR,
  CckThemeChangedEvent,
  DEFAULT_SELECTED_CCK_THEME_ID,
  DEFAULT_SELECTED_CCK_THEME_MODES,
} from '@coco-kits/storybook-theme-switcher';

import { generateCckThemeChangeEventData, getSelectedCckTheme } from './theme-switcher.utils';


export const withCckThemeSwitcher = (StoryFn: StoryFunction<Renderer>) => {

  const setSelectedCckTheme = ({ id, selectedModes }: CckThemeChangedEvent) => {
    const attr = Object.entries(selectedModes).map(([collectionName, mode]) => `${id}__${collectionName}--${mode}`).join(' ');
    document.documentElement.setAttribute(CCK_THEME_DOCUMENT_ATTR, attr);
    document.documentElement.setAttribute(CCK_THEME_NAME_DOCUMENT_ATTR, id);
  };

  addons.getChannel().on(CCK_THEME_CHANGED_EVENT_NAME, setSelectedCckTheme);

  useEffect(() => {
    const lastCckTheme = getSelectedCckTheme();

    const cckTheme = lastCckTheme ?? generateCckThemeChangeEventData({
      id: DEFAULT_SELECTED_CCK_THEME_ID,
      selectedModes: DEFAULT_SELECTED_CCK_THEME_MODES
    });

    setSelectedCckTheme(cckTheme);
  }, []);

  return StoryFn();
};
