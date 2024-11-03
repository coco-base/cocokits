import { Preview } from '@storybook/react';

import '../../../packages/internal/storybook-theme-switcher/src/lib/styles/themes.scss';
import '../../../tools/scripts/storybook/storybook-global.scss';

export const preview: Preview = {
  decorators: [],
  parameters: {
    options: {
      storySort: {
        order: [
          'Getting Started',
          ['Welcome', 'Install', 'Advanced Install'],
          'UI Components',
          'Theme Config',
          'CDK',
          'Utils',
        ],
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
