import { setCompodocJson } from '@storybook/addon-docs/angular';
import { componentWrapperDecorator, moduleMetadata, Preview } from '@storybook/angular';

import {
  StoryColumnComponent,
  StoryColumnsComponent,
  StoryTableCellComponent,
  StoryTableComponent,
} from '@cocokits/storybook-components';

// This file will be available after first build, Just to skip the IDE error we use `require` instead of `import`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const docJson = require('../../../dist/compodoc/angular-kits-doc/documentation.json');
setCompodocJson(docJson);

export const preview: Preview = {
  decorators: [
    componentWrapperDecorator((story) => `<div class="story-wrapper">${story}</div>`),
    moduleMetadata({
      imports: [StoryTableComponent, StoryTableCellComponent, StoryColumnsComponent, StoryColumnComponent],
    }),
  ],
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
