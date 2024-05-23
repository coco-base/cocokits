import type { Meta, StoryObj } from '@storybook/angular';

import { BaseColor, IconSize } from '@coco-kits/common-types';

import { templateIcon } from './template-svg-icon';
import { SvgIconComponent } from '../../src';

const meta: Meta = {
  component: SvgIconComponent,
  title: 'Dev/SvgIcon',
  tags: ['!autodocs'],
  argTypes: {
    color: { control: 'select', options: Object.values(BaseColor) },
    size: { control: 'select', options: Object.values(IconSize) },
  },
};
export default meta;

export const Default: StoryObj<SvgIconComponent> = {
  args: {
    color: BaseColor.Default as any,
    size: IconSize.XXL as any,
    icon: templateIcon as any,
  },
};
