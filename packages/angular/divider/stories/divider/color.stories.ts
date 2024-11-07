import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { DividerComponent } from '../../src/lib/divider/divider.component';

export const Color: AngularStoryObj<DividerComponent> = {
  name: 'Color',
  tags: ['uiBaseComponentName:divider', 'uiBaseComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `
          <cck-divider [color]="..."></cck-divider>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeConfig: getSelectedCckTheme()?.themeConfig,
    },
    template: `
      <story-table
        [headers]="themeConfig?.divider.color?.values"
        [rowHeaders]="themeConfig?.divider.type?.values ?? []"
        [cellHeight]="'100px'">
        @for (type of themeConfig?.divider.type?.values ?? [null]; let row = $index; track type) {
          @for (color of themeConfig?.divider.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-divider [style.margin]="'0 auto'" [type]="type" [color]="color"></cck-divider>
            </story-table-cell>
          }
        }
      </story-table> 
    `,
  }),
};
