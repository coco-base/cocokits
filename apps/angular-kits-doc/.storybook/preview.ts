import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Preview } from '@storybook/angular';

// This file will be available after first build, Just to skip the IDE error we use `require` instead of `import`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const docJson = require('../../../dist/compodoc/angular-kits-doc/documentation.json');
setCompodocJson(docJson);

export const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Getting Started', ['Welcome']],
      },
    },
    controls: {
      disable: true,
      expanded: true,
    },
    actions: {
      disable: true,
    },
  },
};

export default preview;
