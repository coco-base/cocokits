import { useChannel, useEffect } from '@storybook/preview-api';
import { PartialStoryFn as StoryFunction, Renderer } from '@storybook/types';

import {
  DOCUMENT_THEME_ATTR,
  GLOBAL_THEME_ID, THEME_CHANGED_EVENT_NAME, ThemeChangedEvent,
} from '../config/constants';
import { usePreviewTheme } from '../hooks/usePreviewTheme';
import { themeIconSvg } from '../styles/icons';

export const withGlobals = (StoryFn: StoryFunction<Renderer>) => {
  const emit: (eventName: string, args: ThemeChangedEvent) => void = useChannel({});
  const { selectedTheme} = usePreviewTheme();

  useEffect(() => {
    document.documentElement.setAttribute(DOCUMENT_THEME_ATTR, selectedTheme.id);
    window.localStorage.setItem(GLOBAL_THEME_ID, selectedTheme.id);
    emit(THEME_CHANGED_EVENT_NAME, {
      id: selectedTheme.id,
      name: selectedTheme.name,
      iconList: themeIconSvg[selectedTheme.id],
    });
  }, [selectedTheme]);


  return StoryFn();
};
