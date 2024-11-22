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
import { DocumentStyle } from '../utils/document-styles';

addons.register(ADDON_ID, (api) => {
  console.log('Registering CCK Theme Addon');
  const config: StorybookAddonThemeConfig = addons.getConfig()['cck'];

  getInstance(ThemeEvent);
  getInstance(ColorModeEvent);
  getInstance(ThemeSelectionService);

  applyAddonStyles(config);
  addToolsComponent();
  addSidebarLabel();

  // TODO:
  // Mixpanel
});

function applyAddonStyles(config: StorybookAddonThemeConfig) {
  const documentStyle = getInstance(DocumentStyle);
  documentStyle.setAddonTheme();

  if (config.hideToolbar) {
    documentStyle.setAddonHideToolbar();
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
