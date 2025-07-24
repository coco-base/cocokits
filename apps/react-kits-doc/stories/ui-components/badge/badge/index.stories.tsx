import { Badge } from '@cocokits/react-badge';
import { StoriesMeta, withWrapperDecorator } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { MaxIndicator } from './overview/max-indicator.stories';
export { DynamicContent } from './overview/dynamic-content.stories';
export { Integration } from './overview/integration.stories';


const meta: StoriesMeta<typeof Badge> = {
  component: Badge,
  title: 'UI Components/Badge',
  tags: ['status:new'],
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
      componentName: 'badge',
    },
  },
  argTypes: {},
};
export default meta;
