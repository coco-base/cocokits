import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AvatarComponent, AvatarGroupComponent } from '@cocokits/angular-avatar';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta = {
  component: AvatarGroupComponent,
  title: 'UI Components/AvatarGroup',
  tags: ['status:new'],
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [AvatarComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'avatarGroup',
    },
  },
};
export default meta;
