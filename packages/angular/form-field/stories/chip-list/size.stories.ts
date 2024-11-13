import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ChipListComponent } from '../../src/lib/chip-list/chip-list.component';

export const Size: AngularStoryObj<ChipListComponent<string>> = {
  name: 'Size',
  tags: ['uiBaseComponentName:chipList', 'uiBaseComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `
          <cck-form-field [size]="...">
            <cck-label>Chip List</cck-label>
            <cck-chip-list [chips]="['Steak', 'Pizza']" [placeholder]="'Add a new food'">
            </cck-chip-list>
          </cck-form-field>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
      chips: ['Steak', 'Pizza'],
    },
    template: `
      <story-table
        [headers]="themeComponentConfig?.chipList?.type?.values ?? []"
        [rowHeaders]="themeComponentConfig?.chipList?.size?.values"
        cellHAlign="start">
        @for (size of themeComponentConfig?.chipList?.size?.values; let row = $index; track size) {
          @for (type of themeComponentConfig?.chipList?.type?.values ?? [null]; let col = $index; track type) {
            <story-table-cell [row]="row" [col]="col">
              <cck-form-field [size]="size" [type]="type" class="story-w-600">
                <cck-label>Chip List</cck-label>
                <cck-chip-list [chips]="chips" [placeholder]="'Add a new food'" [addOnBlur]="true">
                </cck-chip-list>
              </cck-form-field>
            </story-table-cell>
          }
        }
      </story-table> 
    `,
  }),
};
