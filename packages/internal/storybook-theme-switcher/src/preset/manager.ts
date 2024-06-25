import { addons } from '@storybook/manager-api';

import { registerCckThemeSwitcher } from './register-cck-theme-switcher';
import { registerStorybookThemeSwitcher } from './register-storybook-theme-switcher';
import { ADDON_ID } from '../lib/config/shared.config';
import { registerHideToolbar } from './register-hide-toolbar';
import { registerStorybookCustomStyle } from './register-storybook-custom-style';
import { registerSidenavLabel } from './register-sidenav-label';

addons.register(ADDON_ID, (api) => {
  registerStorybookThemeSwitcher();
  registerCckThemeSwitcher();
  registerHideToolbar(api);
  registerStorybookCustomStyle();
  registerSidenavLabel();
});
