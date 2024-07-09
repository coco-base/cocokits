import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/common-types';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';
import { UIComponentConfig } from '@cocokits/theme-core/angular';

import { IconButtonComponent } from '../../src/lib/icon-button/icon-button.component';

const meta: AngularStoriesMeta = {
  component: IconButtonComponent,
  title: 'Dev/IconButton',
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

export const Default: AngularStoryObj<IconButtonComponent> = {
  args: {
    // color: 'brand',
  },
};
