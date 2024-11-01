import { Preview } from '@storybook/react';

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
