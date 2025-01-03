import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';
import { SvgIconComponent } from '../../src';

export { Default } from './default.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

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
