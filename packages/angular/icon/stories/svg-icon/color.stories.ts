import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SvgIconComponent } from '../../src';

export const Color: AngularStoryObj<SvgIconComponent> = {
  name: 'Color',
  tags: ['uiComponentName:svgIcon', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `<cck-svg-icon [icon]="..." color="..."></cck-svg-icon>`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
      @for (color of uiComponentConfig?.svgIcon.color?.values; track color) {
        <div class="flex-col flex-center gap-12">
          <cck-svg-icon [icon]="icon" [color]="color"></cck-svg-icon>
          <span class="p-sm-regular-2">{{color}}</span>
        </div>
      }
    `,
  }),
};
