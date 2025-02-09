import { Textarea } from '@cocokits/react-components';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';

const meta: StoriesMeta<typeof Textarea> = {
  component: Textarea,
  title: 'UI Components/Textarea',
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'textarea',
    },
  },
};
export default meta;
