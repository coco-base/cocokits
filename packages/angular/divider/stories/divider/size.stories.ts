import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { DividerComponent } from '../../src/lib/divider/divider.component';

export const Size: AngularStoryObj<DividerComponent> = {
  name: 'Size',
  tags: ['uiBaseComponentName:divider', 'uiBaseComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `
          <cck-divider [size]="..."></cck-divider>
        `,
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
        [headers]="themeComponentConfig?.divider?.size?.values"
        [rowHeaders]="themeComponentConfig?.divider?.type?.values ?? []"
        [cellHeight]="'100px'">
        @for (type of themeComponentConfig?.divider?.type?.values ?? [null]; let row = $index; track type) {
          @for (size of themeComponentConfig?.divider?.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-divider [style.margin]="'0 auto'" [type]="type" [size]="size"></cck-divider>
            </story-table-cell>
          }
        }
      </story-table> 
    `,
  }),
};
