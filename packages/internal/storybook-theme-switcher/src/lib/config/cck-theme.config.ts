import { recordReduceMerge } from '@cocokits/common-utils';
import {
  cocokitsUIComponentConfig,
  svgIconMap as svgIconMapDefaultTheme,
  tokenDictionary as tokenDictionaryDefaultTheme,
} from '@cocokits/theme-default';
import {
  frameXUIComponentConfig,
  svgIconMap as svgIconMapFrameXTheme,
  tokenDictionary as tokenDictionaryFrameXTheme,
} from '@cocokits/theme-frame-x';

import { CckTheme, CckThemeId } from './cck-themes.model';
import { TokenDictionary } from '@cocokits/core';

// region ---------------- CONFIG ----------------
export const CCK_THEME_SWITCHER_TOOL_ID = '@cocokits/storybook-theme-switcher:cck-tool-id';
export const CCK_THEME_CHANGED_EVENT_NAME = `cck-storybook-theme-switcher/cck-theme-changed`;
export const CCK_OPEN_THEME_SELECTION_EVENT_NAME = `cck-storybook-theme-switcher/cck-open-theme-selection`;
export const LOCALSTORAGE_CCK_THEME = 'cck-theme-switcher-selected';
export const CCK_THEME_DOCUMENT_ATTR = `data-cck-theme`;
export const CCK_THEME_NAME_DOCUMENT_ATTR = `data-cck-theme-name`;

// endregion

// region THEMES
function getDefaultSelectedModes(tokenDictionary: TokenDictionary) {
  return recordReduceMerge(tokenDictionary.collectionModeNames, (modeNames, collectionName) => {
    return { [collectionName]: modeNames[0].name };
  });
}

export const CCK_THEMES_MAP: Record<CckThemeId, CckTheme> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
    iconPathLight: '/default-logo.png',
    iconPathDark: '/default-logo.png',
    tokenDictionary: tokenDictionaryDefaultTheme,
    defaultSelectedModes: getDefaultSelectedModes(tokenDictionaryDefaultTheme),
    uiComponentConfig: cocokitsUIComponentConfig,
    svgIconMap: svgIconMapDefaultTheme,
    lightCollectionModes: { 'brand-color-1': 'light' },
    darkCollectionModes: { 'brand-color-1': 'dark' },
  },
  'frame-x': {
    id: 'frame-x',
    name: 'FrameX',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et. Lorem ipsum dolor sit',
    iconPathLight: '/frameX-logo-dark.svg',
    iconPathDark: '/frameX-logo-light.svg',
    tokenDictionary: tokenDictionaryFrameXTheme,
    defaultSelectedModes: getDefaultSelectedModes(tokenDictionaryFrameXTheme),
    uiComponentConfig: frameXUIComponentConfig,
    svgIconMap: svgIconMapFrameXTheme,
    lightCollectionModes: { 'color-mode': 'light' },
    darkCollectionModes: { 'color-mode': 'dark' },
  },
};
// endregion

// region DEFAULT THEME
export const DEFAULT_SELECTED_CCK_THEME_ID: CckThemeId = CCK_THEMES_MAP.default.id;
export const DEFAULT_SELECTED_CCK_THEME_MODES = CCK_THEMES_MAP.default.defaultSelectedModes;

// endregion
