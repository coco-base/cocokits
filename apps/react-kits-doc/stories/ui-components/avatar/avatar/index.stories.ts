import { Avatar } from '@cocokits/react-avatar';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';

const meta: StoriesMeta<typeof Avatar> = {
  component: Avatar,
  title: 'UI Components/Avatar',
  decorators: [],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'avatar',
    },
  },
  argTypes: {},
};
export default meta;
