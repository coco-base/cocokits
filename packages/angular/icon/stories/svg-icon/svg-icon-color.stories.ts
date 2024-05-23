import type { StoryObj } from '@storybook/angular';

import { BaseColor, IconSize } from '@coco-kits/common-types';

import { SvgIconComponent } from '../../src';

export const Color: StoryObj<SvgIconComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add Color story description',
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
      <cck-svg-icon [icon]="icon" [size]="IconSize.Lg" [color]="BaseColor.Brand"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.Lg" [color]="BaseColor.Info"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.Lg" [color]="BaseColor.Warning"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.Lg" [color]="BaseColor.Error"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.Lg" [color]="BaseColor.HighContrast"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.Lg" [color]="BaseColor.MediumContrast"></cck-svg-icon>
      <cck-svg-icon [icon]="icon" [size]="IconSize.Lg" [color]="BaseColor.LowContrast"></cck-svg-icon>
    `,
  }),
};
