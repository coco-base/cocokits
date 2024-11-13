import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SvgIconComponent } from '../../src';

export const Color: AngularStoryObj<SvgIconComponent> = {
  name: 'Color',
  tags: ['uiBaseComponentName:svgIcon', 'uiBaseComponentPropName:color'],
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
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
    },
    template: `
      <story-table
        [headers]="themeComponentConfig?.svgIcon?.color?.values"
        [rowHeaders]="themeComponentConfig?.svgIcon?.type?.values ?? []">
        @for (type of themeComponentConfig?.svgIcon?.type?.values ?? [null]; let row = $index; track type) {
          @for (color of themeComponentConfig?.svgIcon?.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-svg-icon [icon]="icon" [color]="color" [type]="type"></cck-svg-icon>
            </story-table-cell>
          }
        }
      </story-table>  
    `,
  }),
};
