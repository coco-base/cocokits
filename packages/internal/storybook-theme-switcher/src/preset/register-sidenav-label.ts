import { addons } from '@storybook/manager-api';

import { StorybookSidenavLabel } from '../lib/componenets/storybook-sidenav/StorybookSidenavLabel';

export function registerSidenavLabel() {
  addons.setConfig({
    sidebar: {
      renderLabel: StorybookSidenavLabel,
    },
  });
}
