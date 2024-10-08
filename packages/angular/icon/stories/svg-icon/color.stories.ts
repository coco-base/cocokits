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
      <story-table
        [headers]="uiComponentConfig?.svgIcon.color?.values"
        [rowHeaders]="uiComponentConfig?.svgIcon.type?.values ?? []">
        @for (type of uiComponentConfig?.svgIcon.type?.values ?? [null]; let row = $index; track type) {
          @for (color of uiComponentConfig?.svgIcon.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-svg-icon [icon]="icon" [color]="color" [type]="type"></cck-svg-icon>
            </story-table-cell>
          }
        }
      </story-table>  
    `,
  }),
};
