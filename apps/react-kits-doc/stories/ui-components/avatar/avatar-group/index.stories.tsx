import { AvatarGroup } from '@cocokits/react-avatar';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta<typeof AvatarGroup> = {
  component: AvatarGroup,
  title: 'UI Components/AvatarGroup',
  tags: ['status:new'],
  decorators: [],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'avatarGroup',
    },
  },
  argTypes: {},
};
export default meta;
