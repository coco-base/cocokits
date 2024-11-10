import { recordReduceMerge } from '@cocokits/common-utils';
import { TokenDictionary } from '@cocokits/core';
import {
  cocokitsThemeConfig,
  svgIconMap as svgIconMapCocokitsTheme,
  tokenDictionary as tokenDictionaryCocokitsTheme,
} from '@cocokits/theme-cocokits';
import {
  framesXThemeConfig,
  svgIconMap as svgIconMapFramesXTheme,
  tokenDictionary as tokenDictionaryFramesXTheme,
} from '@cocokits/theme-frames-x';

import { CckTheme, CckThemeId } from './cck-themes.model';

// region ---------------- CONFIG ----------------
export const CCK_THEME_SWITCHER_TOOL_ID = '@cocokits/storybook-theme-switcher:cck-tool-id';
export const CCK_THEME_CHANGED_EVENT_NAME = `cck-storybook-theme-switcher/cck-theme-changed`;
export const CCK_OPEN_THEME_SELECTION_EVENT_NAME = `cck-storybook-theme-switcher/cck-open-theme-selection`;
export const LOCAL_STORAGE_CCK_THEME = 'cck-theme-switcher-selected';
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
  cocokits: {
    id: 'cocokits',
    name: 'Cocokits',
    description:
      'This is the Cocokits theme for the library, designed by the CocoKits team to provide a balanced and consistent look for all components, ensuring a smooth and cohesive user experience.',
    iconPathLight: '/cocokits-icon-dark.svg',
    iconPathDark: '/cocokits-icon-light.svg',
    tokenDictionary: tokenDictionaryCocokitsTheme,
    defaultSelectedModes: {
      ...getDefaultSelectedModes(tokenDictionaryCocokitsTheme),
      'brand-color-1': 'dark',
    },
    themeConfig: cocokitsThemeConfig,
    svgIconMap: svgIconMapCocokitsTheme,
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
    themeConfig: framesXThemeConfig,
    svgIconMap: svgIconMapFramesXTheme,
    lightCollectionModes: { 'color-mode': 'light' },
    darkCollectionModes: { 'color-mode': 'dark' },
  },
};
// endregion

// region DEFAULT THEME
export const DEFAULT_SELECTED_CCK_THEME_ID: CckThemeId = CCK_THEMES_MAP['frames-x'].id;
export const DEFAULT_SELECTED_CCK_THEME_MODES = CCK_THEMES_MAP.cocokits.defaultSelectedModes;

// endregion
