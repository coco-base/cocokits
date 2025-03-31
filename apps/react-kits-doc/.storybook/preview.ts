import { Preview } from '@storybook/react';

import { PREVIEW_BASE } from '@cocokits/storybook-addon-theme-react';

export const preview: Preview = {
  ...PREVIEW_BASE,
  tags: ['autodocs'],
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
          'Contributing',
          [
            'Guidelines',
            'Architect',
            'Workspace Structure',
            'Kits Doc Structure',
            'Component Examples',
            'Commit',
            'Branch Naming',
          ],
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
