import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { BadgeComponent, BadgeContainerComponent } from '@cocokits/angular-badge';
import { ngArgType, StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { Position } from './overview/position.stories';
export { Integration } from './overview/integration.stories';

const meta: StoriesMeta = {
  component: BadgeContainerComponent,
  title: 'UI Components/BadgeContainer',
  tags: ['status:new'],
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [BadgeComponent],
    }),
  ],
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
  argTypes: {
    ...ngArgType({
      name: 'position',
      type: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'",
      defaultValue: 'top-right',
    }),
    ...ngArgType({ name: 'offset', type: '[string, string]', defaultValue: '' }),
    ...ngArgType({ name: 'radius', type: 'string', defaultValue: '0px' }),
  },
};
export default meta;
