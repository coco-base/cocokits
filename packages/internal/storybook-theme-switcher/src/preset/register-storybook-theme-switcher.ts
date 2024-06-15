import { addons, types } from '@storybook/manager-api';

import {
  LOCALSTORAGE_STORYBOOK_THEME,
  STORYBOOK_THEME_CHANGED_EVENT_NAME,
  STORYBOOK_THEME_SWITCHER_TOOL_ID,
  StorybookThemeChangedEvent,
} from '../index';
import { ToolStorybookThemeSwitcher } from '../lib/componenets/storybook-theme-switcher/ToolStorybookThemeSwitcher';
import { dark } from '../lib/storybook-theme/storybook-dark-theme';
import { light } from '../lib/storybook-theme/storybook-light-theme';

export function registerStorybookThemeSwitcher() {
  listenToThemeChangeEvent();
  dispatchDefaultThemEvent();
  addToolbarIcon();
}

function listenToThemeChangeEvent() {
  const channel = addons.getChannel();
  channel.on(STORYBOOK_THEME_CHANGED_EVENT_NAME, ({ themeName }: StorybookThemeChangedEvent) => {
    const theme = themeName === 'light' ? light : dark;
    window.localStorage.setItem(LOCALSTORAGE_STORYBOOK_THEME, themeName);
    addons.setConfig({ theme });

    document.documentElement.classList.remove('storybook-dark-theme', 'storybook-light-theme');
    document.documentElement.classList.add(`storybook-${themeName}-theme`);
  });
}

function dispatchDefaultThemEvent() {
  const channel = addons.getChannel();
  const defaultStorybookThemeName = 'dark';
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
