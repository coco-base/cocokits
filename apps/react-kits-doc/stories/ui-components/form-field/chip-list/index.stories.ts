import { ChipList } from '@cocokits/react-components';
import { StoriesMeta, withWrapperDecorator } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Size } from './overview/size.stories';
export { Type } from './overview/type.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta<typeof ChipList> = {
  component: ChipList,
  title: 'UI Components/ChipList',
  decorators: [withWrapperDecorator({}, { maxWidth: '530px' })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'chipList',
    },
  },
};
export default meta;
