import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { SvgIconComponent } from '@cocokits/angular-icon';
import { AngularStoriesMeta } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import { templateIcon } from './template-svg-icon';
import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export { Default } from './default.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';
export { ThemeDefaultRounded } from './theme-default-rounded.stories';
export { ThemeDefaultRoundedSize } from './theme-default-rounded-size.stories';
export { ThemeDefaultRoundedColor } from './theme-default-rounded-color.stories';

const meta: AngularStoriesMeta = {
  component: IconButtonComponent,
  title: 'UI Components/IconButton',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
    moduleMetadata({
      imports: [SvgIconComponent],
      providers: [
        {
          provide: UIComponentConfig,
          useValue: getSelectedCckTheme()?.uiComponentConfig,
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
  },
  argTypes: {
    icon: { table: { disable: true } },
  },
  args: {
    icon: templateIcon,
  },
};
export default meta;
