import { addons, types } from '@storybook/manager-api';

import {
  LOCALSTORAGE_STORYBOOK_THEME,
  STORYBOOK_THEME_CHANGED_EVENT_NAME,
  STORYBOOK_THEME_SWITCHER_TOOL_ID,
  StorybookThemeChangedEvent,
} from '../index';
import { ToolStorybookThemeSwitcher } from '../lib/components/storybook-theme-switcher/ToolStorybookThemeSwitcher';
import { getSelectedStorybookTheme } from '../lib/components/theme-switcher.utils';
import { dark } from '../lib/storybook-theme/storybook-dark-theme';
import { light } from '../lib/storybook-theme/storybook-light-theme';
import { LocalStorage } from '../lib/utils/local-storage';

export function registerStorybookThemeSwitcher() {
  listenToThemeChangeEvent();
  dispatchDefaultThemEvent();
  addToolbarIcon();
}

function listenToThemeChangeEvent() {
  const channel = addons.getChannel();
  channel.on(STORYBOOK_THEME_CHANGED_EVENT_NAME, ({ themeName }: StorybookThemeChangedEvent) => {
    const theme = themeName === 'light' ? light : dark;
    LocalStorage.setStorybookTheme(themeName);
    addons.setConfig({ theme });

    document.documentElement.classList.remove('cck-storybook-dark-theme', 'cck-storybook-light-theme');
    document.documentElement.classList.add(`cck-storybook-${themeName}-theme`);
  });
}

function dispatchDefaultThemEvent() {
  const channel = addons.getChannel();
  const defaultStorybookThemeName = getSelectedStorybookTheme() ?? 'dark';
  channel.emit(STORYBOOK_THEME_CHANGED_EVENT_NAME, { themeName: defaultStorybookThemeName });
}

// Register the storybook theme switcher tool
function addToolbarIcon() {
  addons.add(STORYBOOK_THEME_SWITCHER_TOOL_ID, {
    type: types.TOOL,
    title: 'Storybook Theme Switcher',
    match: ({ tabId, viewMode }) => !tabId && viewMode === 'story',
    render: ToolStorybookThemeSwitcher,
  });
}
