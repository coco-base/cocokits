import { Toggle } from '@cocokits/react-toggle';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { Type } from './overview/type.stories';

const meta: StoriesMeta<typeof Toggle> = {
  component: Toggle,
  title: 'UI Components/Toggle',
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'toggle',
    },
  },
};
export default meta;
