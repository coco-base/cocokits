import { addons } from '@storybook/manager-api';

(window as any).STORYBOOK_GA_ID = 'G-DY82W9XYYK';
(window as any).STORYBOOK_REACT_GA_OPTIONS = {};

addons.setConfig({
  sidebar: {
    showRoots: true,
    collapsedRoots: ['cdk', 'theme-config', 'utils'],
  },
  cck: {
    mixpanel: {
      devToken: 'a7cf997febc40f8dbe6ac57da73fa17d',
      prodToken: 'cc7902a14e9314f8c5a439c63493a24a',
    },
  },
});
