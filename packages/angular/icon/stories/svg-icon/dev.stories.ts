import { moduleMetadata, StoryObj } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/common-types';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';
import { UIComponentConfig } from '@cocokits/theme-core/angular';

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

export const Default: StoryObj<SvgIconComponent> = {
  args: {
    icon: templateIcon as any,
  },
};
