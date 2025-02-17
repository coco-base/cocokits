import { Input } from '@cocokits/react-form-field';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';

const meta: StoriesMeta<typeof Input> = {
  component: Input,
  title: 'UI Components/Input',
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'input',
    },
  },
};
export default meta;
