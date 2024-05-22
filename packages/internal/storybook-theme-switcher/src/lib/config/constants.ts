import { SvgIcon } from '@coco-kits/theme-core';

export const THEMES: Theme[] = [
  { id: 'default', name: 'Default', icon: 'default-logo.png' },
  { id: 'default2', name: 'Default-2', icon: 'default-logo.png' },
  { id: 'default3', name: 'Default-3', icon: 'default-logo.png' },
];

export const DEFAULT_THEME = THEMES[0];

export interface Theme {
  id: string;
  name: string;
  icon: string;
}

export interface ThemeChangedEvent {
  id: string;
  name: string;
  iconList: Record<string, SvgIcon>;
}

export interface GlobalArgs {
  [GLOBAL_THEME_ID]: string;
}

/**
 * Addon ID will be use in internal combinations
 */
export const ADDON_ID = '@coco-kits/storybook-theme-switcher';

export const THEME_CHANGED_EVENT_NAME = `cck-storybook-theme-switcher/theme-changed`;
export const SET_THEME_BY_ID_EVENT_NAME = `cck-storybook-theme-switcher/set-theme-by-id`;
export const DOCUMENT_THEME_ATTR = `cck-theme`;

/**
 * Will be use as global state, and it will be visible at url query params
 */
export const GLOBAL_THEME_ID = 'cck-theme-switcher-selected-id';

/**
 * ID of custom element, that will be visible at screen (For example toolbar)
 */
export const TOOL_ID = '@coco-kits/storybook-theme-switcher:tool-id';
