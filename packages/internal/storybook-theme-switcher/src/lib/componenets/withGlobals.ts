import { useChannel, useEffect, useGlobals, useMemo } from '@storybook/preview-api';
import { PartialStoryFn as StoryFunction, Renderer } from '@storybook/types';

import {
  DEFAULT_THEME,
  DOCUMENT_THEM_ATTR,
  GLOBAL_THEME_KEY,
  GlobalArgs,
  THEME_CHANGED_EVENT_NAME,
  THEMES,
} from '../config/constants';
import { themeIconSvg } from '../styles/icons';

export const withGlobals = (StoryFn: StoryFunction<Renderer>) => {
  const emit = useChannel({});

  // The `useTheme` hook cannot be utilized in this context because this component is rendered as a decorator.
  // Decorators are rendered outside of the React environment, which means that React hooks and Storybook hooks
  // from the `react` library or the `@storybook/manager-api` package are not accessible.
  // Fortunately, Storybook provides an alternative implementation of these hooks in a different package.
  // To use these hooks within a decorator, import them from `@storybook/preview-api`.
  const [{ [GLOBAL_THEME_KEY]: selectedId }] = useGlobals() as unknown as [
    GlobalArgs,
    (newGlobals: GlobalArgs) => void
  ];

  const selectedTheme = useMemo(() => {
    return THEMES.find((theme) => theme.id === selectedId) ?? DEFAULT_THEME;
  }, [selectedId]);

  useEffect(() => {
    document.documentElement.setAttribute(DOCUMENT_THEM_ATTR, selectedTheme.id);
    window.localStorage.setItem(GLOBAL_THEME_KEY, selectedTheme.id);
    emit(THEME_CHANGED_EVENT_NAME, {
      name: selectedTheme.name,
      iconList: themeIconSvg[selectedTheme.id],
    });
    // window.dispatchEvent(new CustomEvent('update-json', { detail: themeIconSvg[selectedTheme.id] }));
  }, [selectedTheme]);

  return StoryFn();
};
