import { AvatarLabel } from '@cocokits/react-avatar';
import { StoriesMeta, withWrapperDecorator } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta<typeof AvatarLabel> = {
  component: AvatarLabel,
  title: 'UI Components/AvatarLabel',
  decorators: [
    withWrapperDecorator({ insideBox: true }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'avatarLabel',
    },
  },
  argTypes: {},
};
export default meta;
