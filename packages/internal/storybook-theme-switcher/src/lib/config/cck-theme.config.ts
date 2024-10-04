import { recordReduceMerge } from '@cocokits/common-utils';
import { TokenDictionary } from '@cocokits/core';
import {
  cocokitsUIComponentConfig,
  svgIconMap as svgIconMapDefaultTheme,
  tokenDictionary as tokenDictionaryDefaultTheme,
} from '@cocokits/theme-default';
import {
  framesXUIComponentConfig,
  svgIconMap as svgIconMapFramesXTheme,
  tokenDictionary as tokenDictionaryFramesXTheme,
} from '@cocokits/theme-frames-x';

import { CckTheme, CckThemeId } from './cck-themes.model';

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
    description:
      'This is the default theme for the library, designed by the CocoKits team to provide a balanced and consistent look for all components, ensuring a smooth and cohesive user experience.',
    iconPathLight: '/cocokits-icon-dark.svg',
    iconPathDark: '/cocokits-icon-light.svg',
    tokenDictionary: tokenDictionaryDefaultTheme,
    defaultSelectedModes: {
      ...getDefaultSelectedModes(tokenDictionaryDefaultTheme),
      'brand-color-1': 'dark',
    },
    uiComponentConfig: cocokitsUIComponentConfig,
    svgIconMap: svgIconMapDefaultTheme,
    lightCollectionModes: { 'brand-color-1': 'light' },
    darkCollectionModes: { 'brand-color-1': 'dark' },
  },
  'frames-x': {
    id: 'frames-x',
    name: 'Frames X',
    description:
      'This theme brings a modern and innovative style to component design. It enhances the visual experience with a fresh and unique approach, perfect for projects seeking a distinctive look.',
    iconPathLight: '/framesX-logo-dark.svg',
    iconPathDark: '/framesX-logo-light.svg',
    tokenDictionary: tokenDictionaryFramesXTheme,
    defaultSelectedModes: getDefaultSelectedModes(tokenDictionaryFramesXTheme),
    uiComponentConfig: framesXUIComponentConfig,
    svgIconMap: svgIconMapFramesXTheme,
    lightCollectionModes: { 'color-mode': 'light' },
    darkCollectionModes: { 'color-mode': 'dark' },
  },
};
// endregion

// region DEFAULT THEME
export const DEFAULT_SELECTED_CCK_THEME_ID: CckThemeId = CCK_THEMES_MAP.default.id;
export const DEFAULT_SELECTED_CCK_THEME_MODES = CCK_THEMES_MAP.default.defaultSelectedModes;

// endregion
