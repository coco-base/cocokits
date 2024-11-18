import { addons, types } from '@storybook/manager-api';

import { ADDON_COLOR_MODE_TOOL_ID, ADDON_ID, ADDON_THEME_TOOL_ID } from '../config/addon.config';
import { StorybookAddonThemeConfig } from '../model/addon.model';
import { ThemeEvent } from '../data-access/theme-event/manager-theme-event';
import { getInstance } from '@cocokits/common-utils';
import { ColorModeEvent } from '../data-access/colo-mode-event/manager-color-mode-event';
import { ThemeSelectionService } from '../features/theme-selection/theme-selection.service';
import { ToolColorMode } from '../features/color-mode/tool-color-mode';
import { ToolTheme } from '../features/theme-selection/tool-theme';
import { SidebarLabel } from '../features/sidebar-label/sidebar-label';

addons.register(ADDON_ID, (api) => {
  console.log('Registering CCK Theme Addon');
  const config: StorybookAddonThemeConfig = addons.getConfig()['cck'];

  getInstance(ThemeEvent);
  getInstance(ColorModeEvent);
  getInstance(ThemeSelectionService);

  applyCocoKitsStyle(config);
  addToolsComponent();
  addSidebarLabel();

  // TODO:
  // Mixpanel
});

function applyCocoKitsStyle(config: StorybookAddonThemeConfig) {
  /**
   * Add custom CSS selectors using this prefix to select an element in order to override the style.
   * This will help us easily debug and find our custom styles in the browser.
   */
  document.documentElement.classList.add('cck-storybook-theme');

  if (config.hideToolbar) {
    document.documentElement.classList.add('cck-storybook-theme--remove-toolbar');
  }
}

function addToolsComponent() {
  addons.add(ADDON_COLOR_MODE_TOOL_ID, {
    type: types.TOOL,
    title: 'CocoKits Color Mode',
    match: ({ tabId, viewMode }) => !tabId && viewMode === 'story',
    render: ToolColorMode,
  });

  addons.add(ADDON_THEME_TOOL_ID, {
    type: types.TOOL,
    title: 'CocoKits Theme',
    match: ({ tabId, viewMode }) => !tabId && viewMode === 'story',
    render: ToolTheme,
  });
}

function addSidebarLabel() {
  addons.setConfig({
    sidebar: {
      ...(addons.getConfig().sidebar ?? {}),
      renderLabel: SidebarLabel,
    },
  });
}
