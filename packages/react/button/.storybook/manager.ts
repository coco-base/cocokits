import { addons } from '@storybook/manager-api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).STORYBOOK_GA_ID = '';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).STORYBOOK_REACT_GA_OPTIONS = {};

addons.setConfig({
  sidebar: {
    showRoots: true,
    collapsedRoots: ['cdk', 'theme-config', 'utils'],
  },
  cck: {
    mixpanel: {
      devToken: '',
      prodToken: '',
    },
  },
});
