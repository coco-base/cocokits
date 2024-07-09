import { componentWrapperDecorator, moduleMetadata, type StoryObj } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/common-types';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';
import { UIComponentConfig } from '@cocokits/theme-core/angular';

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

export const Default: StoryObj<ButtonComponent> = {
  args: {
    // color: 'brand',
  },
};
