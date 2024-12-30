import { moduleMetadata } from '@storybook/angular';

import { SvgIconComponent } from '@cocokits/angular-icon';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { withThemeConfigProvider } from '@cocokits/storybook-addon-theme';

import descriptionMd from './description.md';
import { ButtonComponent } from '../../src/lib/button/button.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: AngularStoriesMeta = {
  component: ButtonComponent,
  title: 'UI Components/Button',
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
      componentName: 'button',
    },
  },
};
export default meta;
