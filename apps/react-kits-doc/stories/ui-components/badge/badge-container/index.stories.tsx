import { BadgeContainer } from '@cocokits/react-badge';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { Position } from './overview/position.stories';
export { Integration } from './overview/integration.stories';

const meta: StoriesMeta<typeof BadgeContainer> = {
  component: BadgeContainer,
  title: 'UI Components/BadgeContainer',
  tags: ['status:new'],
  decorators: [],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'badgeContainer',
    },
  },
  argTypes: {},
};
export default meta;
