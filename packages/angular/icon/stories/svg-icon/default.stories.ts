import type { StoryObj } from '@storybook/angular';

import { BaseColor, IconSize } from '@cocokits/common-types';

import { SvgIconComponent } from '../../src';

export const Default: StoryObj<SvgIconComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add size story description',
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      BaseColor: BaseColor,
      IconSize: IconSize,
    },
    template: `
      <cck-svg-icon [icon]="icon" [size]="IconSize.Md" [color]="BaseColor.Brand"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.Lg" [color]="BaseColor.Info"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.XL" [color]="BaseColor.HighContrast"></cck-svg-icon>
    `,
  }),
};
