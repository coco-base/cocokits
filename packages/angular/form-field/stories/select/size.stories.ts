import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SelectComponent } from '../../src/lib/select/select.component';

export const Size: AngularStoryObj<SelectComponent> = {
  name: 'Size',
  tags: ['uiComponentName:select', 'uiComponentPropName:size'],
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
        [headers]="uiComponentConfig?.formField.size?.values"
        [rowHeaders]="uiComponentConfig?.formField.type?.values ?? []">
        @for (type of uiComponentConfig?.formField.type?.values ?? [null]; let row = $index; track type) {
          @for (size of uiComponentConfig?.formField.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-form-field [size]="size" class="story-w-200">
                <cck-label>Favorite food</cck-label>
                <cck-select [placeholder]="'Select you food'">
                  <cck-option [value]="'Steak'">Steak</cck-option>
                  <cck-option [value]="'Pizza'">Pizza</cck-option>
                  <cck-option [value]="'Burger'">Burger</cck-option>
                </cck-select>
              </cck-form-field>
            </story-table-cell>
          }
        }
      </story-table> 
    `,
  }),
};
