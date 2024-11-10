import { moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import { templateIcon } from './template-svg-icon';
import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

export { Default } from './default.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';
export { ThemeCocokitsRounded } from './theme-cocokits-rounded.stories';
export { ThemeCocokitsRoundedSize } from './theme-cocokits-rounded-size.stories';
export { ThemeCocokitsRoundedColor } from './theme-cocokits-rounded-color.stories';

const meta: AngularStoriesMeta = {
  component: IconButtonComponent,
  title: 'UI Components/IconButton',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SvgIconComponent],
      providers: [
        {
          provide: ThemeConfigToken,
          useFactory: () => getSelectedCckTheme()?.themeConfig,
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
