import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { IconButtonComponent } from '@cocokits/angular-button';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { ThemeCocokitsRounded } from './overview/theme-cocokits-rounded.stories';
export { ThemeCocokitsRoundedSize } from './overview/theme-cocokits-rounded-size.stories';
export { ThemeCocokitsRoundedColor } from './overview/theme-cocokits-rounded-color.stories';

export { ModeToggle } from './examples/mode-toggle/index.example.stories';
export { SocialButtons } from './examples/social-buttons/index.example.stories';
export { VolumeButton } from './examples/volume-button/index.example.stories';

const meta: StoriesMeta = {
  component: IconButtonComponent,
  title: 'UI Components/IconButton',
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [SvgIconComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'iconButton',
    },
  },
};
export default meta;
