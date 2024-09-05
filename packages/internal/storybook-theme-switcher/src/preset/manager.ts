import { addons } from '@storybook/manager-api';

import { registerCckThemeSwitcher } from './register-cck-theme-switcher';
import { registerHideToolbar } from './register-hide-toolbar';
import { registerSidenavLabel } from './register-sidenav-label';
import { registerStorybookCustomStyle } from './register-storybook-custom-style';
import { registerStorybookThemeSwitcher } from './register-storybook-theme-switcher';
import { ADDON_ID } from '../lib/config/shared.config';

addons.register(ADDON_ID, (api) => {
  registerStorybookThemeSwitcher();
  registerCckThemeSwitcher();
  registerHideToolbar(api);
  registerStorybookCustomStyle();
  registerSidenavLabel();
});
