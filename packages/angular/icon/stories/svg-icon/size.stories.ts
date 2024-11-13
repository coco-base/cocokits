import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SvgIconComponent } from '../../src';

export const Size: AngularStoryObj<SvgIconComponent> = {
  name: 'Size',
  tags: ['uiBaseComponentName:svgIcon', 'uiBaseComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `<cck-svg-icon [icon]="..." size="..."></cck-svg-icon>`,
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
        [headers]="themeComponentConfig?.svgIcon?.size?.values"
        [rowHeaders]="themeComponentConfig?.svgIcon?.type?.values ?? []">
        @for (type of themeComponentConfig?.svgIcon?.type?.values ?? [null]; let row = $index; track type) {
          @for (size of themeComponentConfig?.svgIcon?.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-svg-icon [icon]="icon" [size]="size" [type]="type"></cck-svg-icon>
            </story-table-cell>
          }
        }
      </story-table> 
    `,
  }),
};
