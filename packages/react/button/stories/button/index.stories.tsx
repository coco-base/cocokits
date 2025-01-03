import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';
import Button from '../../src/lib/button';
import descriptionMd from './description.md?raw';

export { Default as Primary } from './default.stories';

const meta: StoriesMeta<typeof Button> = {
  component: Button,
  title: 'UI Components/Button',
  decorators: [],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'button',
    }
  },
  argTypes: {},
};
export default meta;