import { addons } from '@storybook/manager-api';

import { registerStorybookThemeSwitcher } from './register-storybook-theme-switcher';
import { registerCckThemeSwitcher } from './register-cck-theme-switcher';
import { ADDON_ID } from '../lib/config/shared.config';

addons.register(ADDON_ID, () => {
  registerStorybookThemeSwitcher();
  registerCckThemeSwitcher();
});
