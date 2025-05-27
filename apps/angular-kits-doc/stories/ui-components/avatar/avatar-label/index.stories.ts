import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AvatarComponent, AvatarLabelComponent } from '@cocokits/angular-avatar';
import { StoriesMeta, withThemeConfigProvider, withWrapperDecorator } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta = {
  component: AvatarLabelComponent,
  title: 'UI Components/AvatarLabel',
  tags: ['status:new'],
  decorators: [
    withWrapperDecorator({ insideBox: true }),
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
      componentName: 'avatarLabel',
    },
  },
};
export default meta;
