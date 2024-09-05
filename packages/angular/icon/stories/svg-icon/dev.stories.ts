import { moduleMetadata } from '@storybook/angular';

import { UIComponentConfig } from '@cocokits/angular-core';
import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { templateIcon } from './template-svg-icon';
import { SvgIconComponent } from '../../src';

const meta: AngularStoriesMeta = {
  component: SvgIconComponent,
  title: 'Dev/SvgIcon',
  tags: ['!autodocs'],
  decorators: [
    moduleMetadata({
      providers: [
        {
          provide: UIComponentConfig,
          useFactory: () => getSelectedCckTheme()?.uiComponentConfig,
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

export const Default: AngularStoryObj<SvgIconComponent> = {
  args: {
    icon: templateIcon as any,
  },
};
