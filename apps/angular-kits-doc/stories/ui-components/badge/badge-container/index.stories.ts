import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { BadgeContainerComponent } from '@cocokits/angular-badge';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta = {
  component: BadgeContainerComponent,
  title: 'UI Components/BadgeContainer',
  tags: ['status:new'],
  decorators: [
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
      componentName: 'badgeContainer',
    },
  },
};
export default meta;
