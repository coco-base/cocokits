import { addons, types } from '@storybook/manager-api';

import { getInstance } from '@cocokits/common-utils';

import { ADDON_COLOR_MODE_TOOL_ID, ADDON_ID, ADDON_THEME_TOOL_ID } from '../config/addon.config';
import { ColorModeEvent } from '../data-access/colo-mode-event/manager-color-mode-event';
import { ThemeEvent } from '../data-access/theme-event/manager-theme-event';
import { ToolColorMode } from '../features/color-mode/tool-color-mode';
import { SidebarService } from '../features/sidebar/sidebar.service';
import { SidebarLabel } from '../features/sidebar-label/sidebar-label';
import { StoryControlStore } from '../features/story-control/manager-story-args.store';
import { ThemeSelectionService } from '../features/theme-selection/theme-selection.service';
import { ToolTheme } from '../features/theme-selection/tool-theme';
import { StorybookAddonThemeConfig } from '../model/addon.model';
import { DocumentStyle } from '../utils/document-styles';

addons.register(ADDON_ID, (_api) => {
  console.log('Registering CCK Theme Addon');
  const config: StorybookAddonThemeConfig = addons.getConfig()['cck'];

  // Object.values(events).forEach(evenName => {
  //   addons.getChannel().addListener(evenName, e => console.log(`[STORYBOOK EVENT] ${evenName}`, e));
  // })

  getInstance(ThemeEvent);
  getInstance(ColorModeEvent);
  getInstance(ThemeSelectionService);
  getInstance(SidebarService);

  getInstance(StoryControlStore);

  applyAddonStyles(config);
  addToolsComponent();
  addSidebarLabel();

  // TODO:
  // Mixpanel
});

function applyAddonStyles(config: StorybookAddonThemeConfig | undefined) {
  const documentStyle = getInstance(DocumentStyle);
  documentStyle.setAddonTheme();

  // Libraries storybook for dev, don't have any config files
  if (config?.hideToolbar) {
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
