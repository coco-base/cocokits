import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SelectComponent } from '../../src/lib/select/select.component';

export const Size: AngularStoryObj<SelectComponent> = {
  name: 'Size',
  tags: ['uiBaseComponentName:select', 'uiBaseComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `
          <cck-form-field [size]="size">
            <cck-label>Favorite food</cck-label>
            <cck-select [placeholder]="'Favorite food'">
              <cck-option [value]="'Steak'">Steak</cck-option>
              <cck-option [value]="'Pizza'">Pizza</cck-option>
              <cck-option [value]="'Burger'">Burger</cck-option>
            </cck-select>
          </cck-form-field>
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
        [headers]="themeComponentConfig?.formField?.size?.values"
        [rowHeaders]="themeComponentConfig?.formField?.type?.values ?? []">
        @for (type of themeComponentConfig?.formField?.type?.values ?? [null]; let row = $index; track type) {
          @for (size of themeComponentConfig?.formField?.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-form-field [size]="size" class="story-w-200">
                <cck-label>Favorite food</cck-label>
                <cck-select [placeholder]="'Favorite food'">
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
