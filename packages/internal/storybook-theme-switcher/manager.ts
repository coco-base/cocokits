import { addons, types } from '@storybook/manager-api';
import { ADDON_ID, TOOL_ID } from './src/lib/config/constants';
import { ToolThemeSwitcher } from './src/lib/componenets/ToolThemeSwitcher';

addons.register(ADDON_ID, () => {
  // Register the tool
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Theme Switcher',
    match: ({ tabId, viewMode }) => !tabId && viewMode === 'story',
    render: ToolThemeSwitcher,
  });
});
