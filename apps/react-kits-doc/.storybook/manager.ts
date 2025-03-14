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
      devToken: '407cba158a1703514e219933dbadc271',
      prodToken: '5e695c2ebafb131490469e2a670a9acb',
    },
    hideToolbar: true,
    framework: 'react',
  } satisfies AddonThemeConfig,
});
