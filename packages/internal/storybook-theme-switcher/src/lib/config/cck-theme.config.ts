import { collections } from '@coco-kits/theme-default';

import { CckTheme, CckThemeId } from './cck-themes.model';

// region ---------------- CONFIG ----------------
export const CCK_THEME_SWITCHER_TOOL_ID = '@coco-kits/storybook-theme-switcher:cck-tool-id';
export const CCK_THEME_CHANGED_EVENT_NAME = `cck-storybook-theme-switcher/cck-theme-changed`;
export const CCK_OPEN_THEME_SELECTION_EVENT_NAME = `cck-storybook-theme-switcher/cck-open-theme-selection`;
export const LOCALSTORAGE_CCK_THEME = 'cck-theme-switcher-selected';
export const CCK_THEME_DOCUMENT_ATTR = `data-cck-theme`;
export const CCK_THEME_NAME_DOCUMENT_ATTR = `data-cck-theme-name`;

// endregion
// region DEFAULT THEME
export const DEFAULT_SELECTED_CCK_THEME_ID: CckThemeId = 'default';
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
export const CCK_THEMES_MAP: Record<CckThemeId, CckTheme> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
    iconPathLight: '/default-logo.png',
    iconPathDark: '/default-logo.png',
    collections: collections,
    defaultSelectedModes: {
      global: 'default',
      'local-style': 'default',
      'components-size': 'default',
      'brand-color-1': 'dark',
    },
  },
  'frame-x': {
    id: 'frame-x',
    name: 'FrameX',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et. Lorem ipsum dolor sit',
    iconPathLight: '/frameX-logo-dark.svg',
    iconPathDark: '/frameX-logo-light.svg',
    collections: DummyFrameXCollections,
    defaultSelectedModes: {
      'color-mode': 'dark',
      'color-theme': 'theme-b',
      radius: 'rounded',
      sizing: 'compact',
      typography: 'font-b',
      'local-style': 'default',
    },
  },
  theme2: {
    id: 'theme2',
    name: 'Theme2',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et.',
    iconPathLight: '/default-logo.png',
    iconPathDark: '/default-logo.png',
    collections: DummyTheme2Collections,
    defaultSelectedModes: {
      'color-palette': 'light',
      brand: 'default',
      radius: 'full-rounded',
      sizing: 'compact',
      typography: 'poppins',
      'local-style': 'default',
    },
  },
};
// endregion
