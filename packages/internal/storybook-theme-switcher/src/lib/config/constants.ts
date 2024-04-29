export const THEMES: Theme[] = [{ id: 'finalui', name: 'Finalui', icon: 'finalui-logo.png' }];

export const DEFAULT_THEME = THEMES[0];

export type ThemeId = string;

export interface Theme {
  id: ThemeId;
  name: string;
  icon: string;
}

export interface GlobalArgs {
  [GLOBAL_THEME_KEY]: ThemeId;
}

export const PREFIX = 'cck-';

/**
 * Addon ID will be use in internal combinations
 */
export const ADDON_ID = '@coco-kit/storybook-theme-switcher';

/**
 * Will be use as global state, and it will be visible at url query params
 */
export const GLOBAL_THEME_KEY = 'cck-theme';

/**
 * ID of custom element, that will be visible at screen (For example toolbar)
 */
export const TOOL_ID = '@coco-kit/storybook-theme-switcher:tool-id';
