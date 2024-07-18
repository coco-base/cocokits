import { moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';
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

export const Default: AngularStoryObj<SvgIconComponent> = {
  args: {
    icon: templateIcon as any,
  },
};
