import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { getInstance } from '@cocokits/common-utils';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { PreviewThemeEvent } from '@cocokits/storybook-addon-theme';

import descriptionMd from './description.md';
import { ButtonComponent } from '../../src/lib/button/button.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: AngularStoriesMeta = {
  component: ButtonComponent,
  title: 'UI Components/Button',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="story-decorator-wrapper">${story}</div>`),
    moduleMetadata({
      imports: [SvgIconComponent],
      providers: [
        {
          provide: ThemeConfigToken,
          useFactory: () => getInstance(PreviewThemeEvent).getCurrentTheme().themeConfig,
        },
      ],
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
  argTypes: {
    cckControl: { control: 'object' },
  },
};
export default meta;
