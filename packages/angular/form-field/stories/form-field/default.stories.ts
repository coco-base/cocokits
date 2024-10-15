import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src/lib/form-field/form-field.component';

export const Default: AngularStoryObj<FormFieldComponent> = {
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
      <story-table cellHAlign="start" cellVAlign="start">
        
        <story-table-cell row="0" col="0">
          <cck-form-field class="story-w-200">
            <cck-label>Input</cck-label>
            <input cckInput placeholder="Placeholder"/>
          </cck-form-field>
        </story-table-cell>
        
        <story-table-cell row="0" col="1">
          <cck-form-field class="story-w-200">
            <cck-label>Textarea</cck-label>
            <textarea cckTextarea placeholder="Placeholder"></textarea>
          </cck-form-field>
        </story-table-cell>
        
        <story-table-cell row="0" col="2">
          <cck-form-field class="story-w-200">
            <cck-label>Select</cck-label>
            <cck-select [placeholder]="'Favorite food'">
              <cck-option [value]="'Steak'">Steak</cck-option>
              <cck-option [value]="'Pizza'">Pizza</cck-option>
              <cck-option [value]="'Burger'">Burger</cck-option>
            </cck-select>
          </cck-form-field>
        </story-table-cell>
        
        <story-table-cell row="1" col="0" colSpan="3">
          <cck-form-field class="story-w-600">
            <cck-label>ChipList</cck-label>
            <cck-chip-list [chips]="['Steak', 'Pizza', 'Burger']" [placeholder]="'Add a new food'" [addOnBlur]="true"/>
          </cck-form-field>
        </story-table-cell>
        
      </story-table>
    `,
  }),
};
