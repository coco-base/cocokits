import { addons } from '@storybook/manager-api';
import { AddonThemeConfig } from '@cocokits/storybook-addon-theme';

(window as any).STORYBOOK_GA_ID = '';
(window as any).STORYBOOK_REACT_GA_OPTIONS = {};

addons.setConfig({
  sidebar: {
    showRoots: true,
    collapsedRoots: ['cdk', 'theme-config', 'utils'],
  },
  cck: {
    mixpanel: {
      devToken: '1b29125c166811fbefa92a71daac829d',
      prodToken: '9ca9d99b4d98f361e27b1a40dca9e2af',
    },
    hideToolbar: true,
    framework: 'react',
  } satisfies AddonThemeConfig,
});
