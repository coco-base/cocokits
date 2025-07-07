import { Tab, Tabs } from '@cocokits/react-tabs';
import { StoriesMeta, withWrapperDecorator } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { Disabled } from './overview/disabled.stories';
export { CustomHeader } from './overview/custom-header.stories';
export { Control } from './overview/control.stories';

const meta: StoriesMeta<typeof Tabs> = {
  component: Tabs,
  title: 'UI Components/Tabs',
  subcomponents: {Tab},
  tags: ['status:new'],
  decorators: [
    withWrapperDecorator({insideBox: true}, {width: '500px'}),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'tabs',
      subcomponents: {
        Tab: {
          name: 'tab',
          description: 'The Tab component represents a single tab within the Tabs component. It can be used to define the content and header of each tab.',
        },
      }
    },
  },
  argTypes: {},
};
export default meta;
