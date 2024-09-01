import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { UIComponentConfig } from '@cocokits/angular-core';
import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

const meta: AngularStoriesMeta = {
  component: ToggleComponent,
  title: 'Dev/Toggle',
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
  argTypes: {
    type: { control: 'text' },
    color: { control: 'text' },
    size: { control: 'text' },
  },
};

export default meta;

export const Default: AngularStoryObj<ToggleComponent> = {
  args: {
    // color: 'brand',
  },
};
