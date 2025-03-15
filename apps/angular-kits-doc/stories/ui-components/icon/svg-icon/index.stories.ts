import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { SvgIconComponent } from '@cocokits/angular-icon';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta = {
  component: SvgIconComponent,
  title: 'UI Components/SvgIcon',
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({}),
  ],
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
