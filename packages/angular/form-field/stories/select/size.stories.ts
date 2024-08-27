import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SelectComponent } from '../../src/lib/select/select.component';

export const Size: AngularStoryObj<SelectComponent> = {
  name: 'Size',
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
      <table class="story-variant-table story-variant-table--no-col-header">
        <thead>
          @for (size of uiComponentConfig?.formField.size?.values; track size) {
            <th>{{size}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (size of uiComponentConfig?.formField.size?.values; track size) {
              <td>
                <cck-form-field [size]="size" class="story-w-200">
                  <cck-label>Favorite food</cck-label>
                  <cck-select [placeholder]="'Select you food'">
                    <cck-option [value]="'Steak'">Steak</cck-option>
                    <cck-option [value]="'Pizza'">Pizza</cck-option>
                    <cck-option [value]="'Burger'">Burger</cck-option>
                  </cck-select>
                </cck-form-field>
              </td>
            }
          </tr>
        </tbody>
      </table>
    `,
  }),
};
