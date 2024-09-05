import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src/lib/form-field/form-field.component';

export const Default: AngularStoryObj<FormFieldComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
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
      <div class="flex-col gap-32">

        <!--Input, Textarea,Select -->
        <div class="flex-row gap-32">
          <cck-form-field>
            <cck-label>Input</cck-label>
            <input cckInput placeholder="Placeholder"/>
          </cck-form-field>
  
          <cck-form-field>
            <cck-label>Textarea</cck-label>
            <textarea cckTextarea placeholder="Placeholder"></textarea>
          </cck-form-field>
       
          <cck-form-field class="story-w-200">
            <cck-label>Select</cck-label>
            <cck-select [placeholder]="'Select you food'">
              <cck-option [value]="'Steak'">Steak</cck-option>
              <cck-option [value]="'Pizza'">Pizza</cck-option>
              <cck-option [value]="'Burger'">Burger</cck-option>
            </cck-select>
          </cck-form-field>
        </div>
      
        <!--ChipList-->
        <cck-form-field class="story-w-600">
          <cck-label>ChipList</cck-label>
          <cck-chip-list [chips]="['Steak', 'Pizza', 'Burger']" [placeholder]="'Add a new food'" [addOnBlur]="true"/>
        </cck-form-field>
        
      </div>
    `,
  }),
};
