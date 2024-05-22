import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Parameters } from '@storybook/types';

// This file will be available after first build, Just to skip the IDE error we use `require` instead of `import`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const docJson = require('../../../../dist/compodoc/angular-kits-doc/documentation.json');
setCompodocJson(docJson);

export const parameters: Parameters = {
  viewMode: 'docs',
  controls: {
    disable: true,
    expanded: true,
  },
  actions: {
    disable: true,
  },
};
