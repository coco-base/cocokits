import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AvatarComponent } from '@cocokits/angular-avatar';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';

const meta: StoriesMeta = {
  component: AvatarComponent,
  title: 'UI Components/Avatar',
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
      componentName: 'avatar',
    },
  },
};
export default meta;
