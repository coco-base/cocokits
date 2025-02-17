import { SvgIcon } from '@cocokits/react-icon';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta<typeof SvgIcon> = {
  component: SvgIcon,
  title: 'UI Components/SvgIcon',
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'svgIcon',
    },
  },
};
export default meta;
