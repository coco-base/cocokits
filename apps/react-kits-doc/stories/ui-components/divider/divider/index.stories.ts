import { Divider } from '@cocokits/react-components';
import { StoriesMeta, withWrapperDecorator } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta<typeof Divider> = {
  component: Divider,
  decorators: [withWrapperDecorator({ direction: 'row', insideBox: true }, { width: '200px', height: '100px' })],
  title: 'UI Components/Divider',
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'divider',
    },
  },
};
export default meta;
