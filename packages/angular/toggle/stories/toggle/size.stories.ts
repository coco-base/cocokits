import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Size: AngularStoryObj<ToggleComponent> = {
  name: 'Size',
  tags: ['uiBaseComponentName:toggle', 'uiBaseComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `
          <cck-toggle [checked]="true" [size]="...">Slide me!</cck-toggle>
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
        [headers]="themeConfig?.toggle.size?.values"
        [rowHeaders]="themeConfig?.toggle.type?.values ?? []">
        @for (type of themeConfig?.toggle.type?.values ?? [null]; let row = $index; track type) {
          @for (size of themeConfig?.toggle.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-toggle checked="true" [size]="size" [type]="type"></cck-toggle>
            </story-table-cell>
          }
        }
      </story-table> 
    `,
  }),
};
