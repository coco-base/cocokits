import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { BadgeComponent } from '@cocokits/angular-badge';
import {
  ngArgType,
  StoriesMeta,
  withThemeConfigProvider,
  withWrapperDecorator,
} from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { MaxIndicator } from './overview/max-indicator.stories';
export { DynamicContent } from './overview/dynamic-content.stories';
export { Integration } from './overview/integration.stories';

const meta: StoriesMeta = {
  component: BadgeComponent,
  title: 'UI Components/Badge',
  decorators: [
    withWrapperDecorator({ insideBox: true }),
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [],
    }),
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
  argTypes: {
    ...ngArgType({ name: 'content', type: 'number | string | undefined | null', defaultValue: '' }),
    ...ngArgType({ name: 'max', type: 'number' }),
    ...ngArgType({ name: 'hide', type: 'boolean', defaultValue: 'false' }),
  },
};
export default meta;
