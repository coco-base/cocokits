import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SelectComponent } from '../../src/lib/select/select.component';

export const Default: AngularStoryObj<SelectComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
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
        [headers]="['Default', 'No Label', 'Multi', 'Disabled']"
        cellVAlign="end">
        
        <!-- Default --> 
        <story-table-cell col="0">
          <cck-form-field class="story-w-200">
            <cck-label>Favorite food</cck-label>
            <cck-select [placeholder]="'Select you food'">
              <cck-option [value]="'Steak'">Steak</cck-option>
              <cck-option [value]="'Pizza'">Pizza</cck-option>
              <cck-option [value]="'Burger'">Burger</cck-option>
            </cck-select>
          </cck-form-field>
        </story-table-cell>
        
        <!-- No Label --> 
        <story-table-cell col="1">
          <cck-form-field class="story-w-200">
            <cck-select [placeholder]="'Select you food'">
              <cck-option [value]="'Steak'">Steak</cck-option>
              <cck-option [value]="'Pizza'">Pizza</cck-option>
              <cck-option [value]="'Burger'">Burger</cck-option>
            </cck-select>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Multi --> 
        <story-table-cell col="2">
          <cck-form-field class="story-w-200">
            <cck-select [multiple]="true" [placeholder]="'Select you food'">
              <cck-option [value]="'Steak'">Steak</cck-option>
              <cck-option [value]="'Pizza'">Pizza</cck-option>
              <cck-option [value]="'Burger'">Burger</cck-option>
            </cck-select>
          </cck-form-field>
        </story-table-cell>
        
        <!-- Disabled --> 
        <story-table-cell col="3">
          <cck-form-field class="story-w-200" [disabled]="true">
            <cck-select [placeholder]="'Select you food'">
              <cck-option [value]="'Steak'">Steak</cck-option>
              <cck-option [value]="'Pizza'">Pizza</cck-option>
              <cck-option [value]="'Burger'">Burger</cck-option>
            </cck-select>
          </cck-form-field>
        </story-table-cell>
      </story-table>
    `,
  }),
};
