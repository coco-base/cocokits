import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ButtonComponent } from '../../src/lib/button/button.component';

const meta: AngularStoriesMeta = {
  component: ButtonComponent,
  title: 'Dev/Button',
  tags: ['!autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
    moduleMetadata({
      providers: [
        {
          provide: ThemeConfigToken,
          useFactory: () => getSelectedCckTheme()?.themeConfig,
        },
      ],
    }),
  ],
  argTypes: {},
};

export default meta;

export const Default: AngularStoryObj<ButtonComponent> = {
  args: {
    // color: 'brand',
  },
};
