import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Size: AngularStoryObj<ToggleComponent> = {
  name: 'Size',
  tags: ['uiComponentName:toggle', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
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
        [headers]="uiComponentConfig?.toggle.size?.values"
        [rowHeaders]="uiComponentConfig?.toggle.type?.values ?? []">
        @for (type of uiComponentConfig?.toggle.type?.values ?? [null]; let row = $index; track type) {
          @for (size of uiComponentConfig?.toggle.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-toggle checked="true" [size]="size" [type]="type"></cck-toggle>
            </story-table-cell>
          }
        }
      </story-table> 
    `,
  }),
};
