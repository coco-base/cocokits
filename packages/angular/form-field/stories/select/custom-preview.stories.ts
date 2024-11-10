import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SelectComponent } from '../../src/lib/select/select.component';

export const CustomPreview: AngularStoryObj<SelectComponent> = {
  name: 'CustomPreview',
  parameters: {
    docs: {
      description: {
        story: `Displays the select component with a customized view for the selected item, enabling more complex and visually rich representations instead of just plain text.`,
      },
      source: {
        code: `
          <cck-form-field>
            <cck-label>Favorite food</cck-label>
            <cck-select [(ngModel)]="modelValue" [multiple]="true" [placeholder]="'Favorite food'">
              <cck-select-preview>
                {{modelValue[0]}}
                @if(modelValue.length > 1) {
                  <span style="opacity: 0.5">(+{{modelValue.length - 1}} more)</span>
                }
              </cck-select-preview>
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
      modelValue: [],
    },
    template: `
      <cck-form-field class="story-w-200">
        <cck-label>Favorite food</cck-label>
        <cck-select [(ngModel)]="modelValue" [multiple]="true" [placeholder]="'Favorite food'">
          <cck-select-preview>
            {{modelValue[0]}}
            @if(modelValue.length > 1) {
              <span style="opacity: 0.5">(+{{modelValue.length - 1}} more)</span>
            }
          </cck-select-preview>
          <cck-option [value]="'Steak'">Steak</cck-option>
          <cck-option [value]="'Pizza'">Pizza</cck-option>
          <cck-option [value]="'Burger'">Burger</cck-option>
        </cck-select>
      </cck-form-field>
    `,
  }),
};
