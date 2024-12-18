import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SelectComponent } from '../../src/lib/select/select.component';

export const OptionGroup: AngularStoryObj<SelectComponent> = {
  name: 'OptionGroup',
  parameters: {
    docs: {
      description: {
        story: `Shows the select component with grouped options, demonstrating how different options can be organized together for improved categorization and user experience.`,
      },
      source: {
        code: `
          <cck-form-field>
            <cck-label>Favorite food</cck-label>
            <cck-select [multiple]="true" [placeholder]="'Favorite food'">
              <cck-option-group disabled [label]="'Order 1'">
                <cck-option [value]="'Steak-1'">Steak</cck-option>
                <cck-option [value]="'Pizza-1'">Pizza</cck-option>
                <cck-option [value]="'Burger-1'">Burger</cck-option>
              </cck-option-group>
              <cck-option-group [label]="'Order 2'">
                <cck-option [value]="'Steak-2'">Steak</cck-option>
                <cck-option disabled [value]="'Pizza-2'">Pizza</cck-option>
                <cck-option [value]="'Burger-2'">Burger</cck-option>
              </cck-option-group>
            </cck-select>
          </cck-form-field>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <story-table
        [headers]="['Group', 'Group With Disabled']">
        
        <!-- Group -->
        <story-table-cell row="0" col="0">
          <cck-form-field class="story-w-200">
            <cck-label>Favorite food</cck-label>
            <cck-select [multiple]="true" [placeholder]="'Favorite food'">
              <cck-option-group [label]="'Order 1'">
                <cck-option [value]="'Steak-1'">Steak</cck-option>
                <cck-option [value]="'Pizza-1'">Pizza</cck-option>
                <cck-option [value]="'Burger-1'">Burger</cck-option>
              </cck-option-group>
              <cck-option-group [label]="'Order 2'">
                <cck-option [value]="'Steak-2'">Steak</cck-option>
                <cck-option [value]="'Pizza-2'">Pizza</cck-option>
                <cck-option [value]="'Burger-2'">Burger</cck-option>
              </cck-option-group>
            </cck-select>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Group With Disabled -->
        <story-table-cell row="0" col="1">
          <cck-form-field class="story-w-200">
            <cck-label>Favorite food</cck-label>
            <cck-select [multiple]="true" [placeholder]="'Favorite food'">
              <cck-option-group disabled [label]="'Order 1'">
                <cck-option [value]="'Steak-1'">Steak</cck-option>
                <cck-option [value]="'Pizza-1'">Pizza</cck-option>
                <cck-option [value]="'Burger-1'">Burger</cck-option>
              </cck-option-group>
              <cck-option-group [label]="'Order 2'">
                <cck-option [value]="'Steak-2'">Steak</cck-option>
                <cck-option disabled [value]="'Pizza-2'">Pizza</cck-option>
                <cck-option [value]="'Burger-2'">Burger</cck-option>
              </cck-option-group>
            </cck-select>
          </cck-form-field>
        </story-table-cell>
      </story-table>
    `,
  }),
};
