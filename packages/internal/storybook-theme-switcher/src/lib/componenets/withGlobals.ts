import { PartialStoryFn as StoryFunction, Renderer } from '@storybook/types';
import { DEFAULT_THEME, GLOBAL_THEME_KEY, GlobalArgs, PREFIX, THEMES } from '../config/constants';
import { useEffect, useMemo, useGlobals } from '@storybook/preview-api';

export const withGlobals = (StoryFn: StoryFunction<Renderer>) => {
  console.log('----');

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
    document.documentElement.setAttribute(`${PREFIX}theme`, selectedTheme.id);
    window.localStorage.setItem(GLOBAL_THEME_KEY, selectedTheme.id);
  }, [selectedTheme]);

  return StoryFn();
};
