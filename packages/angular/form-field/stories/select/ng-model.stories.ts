import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SelectComponent } from '../../src';

export const NgModel: AngularStoryObj<SelectComponent> = {
  name: 'NgModel',
  parameters: {
    docs: {
      description: {
        story: `Demonstrates how to use Angular's NgModel for two-way data binding, enabling automatic synchronization between the UI element and the model.`,
      },
      source: {
        code: `
          TODO: ...
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
      modelValue: 'Default Value',
    },
    template: `
      <div class="flex-col w-200 justify-center">
      
          <cck-form-field class="story-w-200">
            <cck-label>NgModel</cck-label>
            <cck-select [(ngModel)]="modelValue" [placeholder]="'Select you food'">
              <cck-option [value]="'Steak'">Steak</cck-option>
              <cck-option [value]="'Pizza'">Pizza</cck-option>
              <cck-option [value]="'Burger'">Burger</cck-option>
            </cck-select>
          </cck-form-field>
        
        <div class="hr-v"></div>
        
        <div class="flex-col gap-24 align-center">
          <div class="p-sm-regular-3">NgModel Value: {{modelValue}}</div>
          <input class="story-input" [(ngModel)]="modelValue"/>
        </div>
      </div>
      
    `,
  }),
};
