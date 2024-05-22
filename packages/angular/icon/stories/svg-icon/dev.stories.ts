import type { Meta, StoryObj } from '@storybook/angular';

import { SvgIconComponent } from '../../src';

const meta: Meta = {
  component: SvgIconComponent,
  title: 'SvgIcon',
  tags: ['!autodocs'],
};
export default meta;

export const Default: StoryObj<SvgIconComponent> = {
  args: {
    icon: JSON.parse('{"name":"caret-tr","content":"<path d=\\"M352 160v192L160 160z\\" />","viewBox":"0 0 512 512"}'),
  },
};
