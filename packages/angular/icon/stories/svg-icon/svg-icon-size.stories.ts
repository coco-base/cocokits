import type { StoryObj } from '@storybook/angular';

import { BaseColor, IconSize } from '@coco-kits/common-types';

import { SvgIconComponent } from '../../src';

export const Size: StoryObj<SvgIconComponent> = {
  name: 'Size',
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
      IconSize: IconSize,
      BaseColor: BaseColor,
    },
    template: `
      <cck-svg-icon [icon]="icon" [size]="IconSize.XS" [color]="BaseColor.HighContrast"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.Sm" [color]="BaseColor.HighContrast"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.Md" [color]="BaseColor.HighContrast"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.Lg" [color]="BaseColor.HighContrast"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.XL" [color]="BaseColor.HighContrast"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.XXL" [color]="BaseColor.HighContrast"></cck-svg-icon>
    `,
  }),
};
