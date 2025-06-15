import { Menu, MenuItem } from '@cocokits/react-components';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta<typeof Menu> = {
  component: Menu,
  subcomponents: { MenuItem },
  title: 'UI Components/Menu',
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'menu',
      subcomponents: {
        MenuItem: { name: 'menuItem' },
      },
    },
  },
};
export default meta;
