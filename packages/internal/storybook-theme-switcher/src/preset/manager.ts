import { addons } from '@storybook/manager-api';

import { registerCckThemeSwitcher } from './register-cck-theme-switcher';
import { registerHideToolbar } from './register-hide-toolbar';
import { registerMixpanel } from './register-mixpanel';
import { registerSidenavLabel } from './register-sidenav-label';
import { registerStorybookCustomStyle } from './register-storybook-custom-style';
import { registerStorybookThemeSwitcher } from './register-storybook-theme-switcher';
import { ADDON_ID } from '../lib/config/shared.config';
import { CckStorybookConfig } from '../lib/config/storybook-config.model';

addons.register(ADDON_ID, (api) => {
  const config: CckStorybookConfig = addons.getConfig().cck;

  registerStorybookThemeSwitcher();
  registerCckThemeSwitcher();
  registerHideToolbar(api);
  registerStorybookCustomStyle();
  registerSidenavLabel();
  registerMixpanel(api, config);
});
