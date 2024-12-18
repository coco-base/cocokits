import { moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import { templateIcon } from './template-svg-icon';
import { SvgIconComponent } from '../../src';

export { Default } from './default.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: AngularStoriesMeta = {
  component: SvgIconComponent,
  title: 'UI Components/SvgIcon',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
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
    types: { table: { disable: true } },
    sizes: { table: { disable: true } },
    colors: { table: { disable: true } },
  },
  args: {
    icon: templateIcon,
  },
};
export default meta;
