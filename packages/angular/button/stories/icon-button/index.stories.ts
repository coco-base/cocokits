import { moduleMetadata } from '@storybook/angular';

import { SvgIconComponent } from '@cocokits/angular-icon';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { withThemeConfigProvider } from '@cocokits/storybook-addon-theme';

import descriptionMd from './description.md';
import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';
export { ThemeCocokitsRounded } from './theme-cocokits-rounded.stories';
export { ThemeCocokitsRoundedSize } from './theme-cocokits-rounded-size.stories';
export { ThemeCocokitsRoundedColor } from './theme-cocokits-rounded-color.stories';

const meta: AngularStoriesMeta = {
  component: IconButtonComponent,
  title: 'UI Components/IconButton',
  decorators: [
    moduleMetadata({
      imports: [SvgIconComponent],
      providers: [withThemeConfigProvider()],
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
