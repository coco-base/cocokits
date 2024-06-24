import type { StoryObj } from '@storybook/angular';

import { BaseColor, IconSize } from '@cocokits/common-types';

import { SvgIconComponent } from '../../src';

export const Color: StoryObj<SvgIconComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: `This scenario demonstrates the range of color options available from the BaseColor enum for the SvgIconComponent. Observe how different colors modify the appearance of the icons, enhancing visual integration with your application's design palette.`,
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
