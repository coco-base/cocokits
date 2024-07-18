import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';
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
          provide: UIComponentConfig,
          useValue: getSelectedCckTheme()?.uiComponentConfig,
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
