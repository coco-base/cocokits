import { collections } from '@coco-kits/theme-default';

import { CckTheme, CckThemeName } from './cck-themes.model';

// region ---------------- CONFIG ----------------
export const CCK_THEME_SWITCHER_TOOL_ID = '@coco-kits/storybook-theme-switcher:cck-tool-id';
export const CCK_THEME_CHANGED_EVENT_NAME = `cck-storybook-theme-switcher/cck-theme-changed`;
export const CCK_OPEN_THEME_SELECTION_EVENT_NAME = `cck-storybook-theme-switcher/cck-open-theme-selection`;
export const LOCALSTORAGE_CCK_THEME = 'cck-theme-switcher-selected';
export const CCK_THEME_DOCUMENT_ATTR = `data-cck-theme`;

// endregion
// region DEFAULT THEME
export const DEFAULT_SELECTED_CCK_THEME_NAME: CckThemeName = 'Default';
export const DEFAULT_SELECTED_CCK_THEME_MODES = {
  global: 'default',
  'local-style': 'default',
};

// endregion
// region THEMES
const DummyTheme2Collections = {
  'color-palette': ['dark', 'light'],
  brand: ['default'],
  radius: ['default', 'rounded', 'full-rounded'],
  sizing: ['large', 'compact', 'spacious'],
  typography: ['inter', 'roboto', 'poppins'],
  'local-style': ['default'],
};
const DummyFrameXCollections = {
  'color-mode': ['dark', 'light'],
  'color-theme': ['theme-a', 'theme-b'],
  radius: ['default', 'rounded'],
  sizing: ['compact', 'spacious'],
  typography: ['font-a', 'font-b'],
  'local-style': ['default'],
};
export const CCK_THEMES: Record<CckThemeName, CckTheme> = {
  Theme2: {
    name: 'Theme2',
    iconPathLight: '/default-logo.png',
    iconPathDark: '/default-logo.png',
    collections: DummyTheme2Collections,
  },
  Default: {
    name: 'Default',
    iconPathLight: '/default-logo.png',
    iconPathDark: '/default-logo.png',
    collections: collections,
  },
  FrameX: {
    name: 'FrameX',
    iconPathLight: '/frameX-logo-dark.svg',
    iconPathDark: '/frameX-logo-light.svg',
    collections: DummyFrameXCollections,
  },
};
// endregion
