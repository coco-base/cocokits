import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SvgIconComponent } from '../../src';

export const Size: AngularStoryObj<SvgIconComponent> = {
  name: 'Size',
  tags: ['uiComponentName:svgIcon', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'This scenario displays the SvgIconComponent in all predefined sizes from the IconSize enum. Experience how each size option enhances icon visibility and aesthetics across your user interface.',
      },
      source: {
        code: `<cck-svg-icon [icon]="..." size="..."></cck-svg-icon>`,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
      @for (size of uiComponentConfig?.svgIcon.size?.values; track size) {
        <div class="flex-col flex-center gap-12">
          <cck-svg-icon [icon]="icon" [size]="size"></cck-svg-icon>
          <span class="p-sm-regular-2">{{size}}</span>
        </div>
      }
    `,
  }),
};
