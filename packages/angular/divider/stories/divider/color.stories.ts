import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { DividerComponent } from '../../src/lib/divider/divider.component';

export const Color: AngularStoryObj<DividerComponent> = {
  name: 'Color',
  tags: ['uiComponentName:divider', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `TODO: Add source code of story`,
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
        [headers]="uiComponentConfig?.divider.color?.values"
        [rowHeaders]="uiComponentConfig?.divider.type?.values ?? []"
        [cellHeight]="'100px'">
        @for (type of uiComponentConfig?.divider.type?.values ?? [null]; let row = $index; track type) {
          @for (color of uiComponentConfig?.divider.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-divider [style.margin]="'0 auto'" [type]="type" [color]="color"></cck-divider>
            </story-table-cell>
          }
        }
      </story-table> 
    `,
  }),
};
