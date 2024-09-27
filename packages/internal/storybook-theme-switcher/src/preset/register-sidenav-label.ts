import { addons } from '@storybook/manager-api';

import { StorybookSidenavLabel } from '../lib/components/storybook-sidenav/StorybookSidenavLabel';

export function registerSidenavLabel() {
  const currentConfig = addons.getConfig();
  addons.setConfig({
    sidebar: {
      ...(currentConfig.sidebar ?? {}),
      renderLabel: StorybookSidenavLabel,
    },
  });
}
