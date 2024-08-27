import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { SelectComponent } from '../../src/lib/select/select.component';

export const Default: AngularStoryObj<SelectComponent> = {
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
      <table class="story-variant-table story-variant-table--no-col-header story-variant-table--bottom-align">
        <thead>
          <th>Default</th>
          <th>No Label</th>
          <th>Multi</th>
          <th>Disabled</th>
        </thead>
        <tbody>
          <tr>
              <td>
                <cck-form-field class="story-w-200">
                  <cck-label>Favorite food</cck-label>
                  <cck-select [placeholder]="'Select you food'">
                    <cck-option [value]="'Steak'">Steak</cck-option>
                    <cck-option [value]="'Pizza'">Pizza</cck-option>
                    <cck-option [value]="'Burger'">Burger</cck-option>
                  </cck-select>
                </cck-form-field>
              </td>
              
              <td>
                <cck-form-field class="story-w-200">
                  <cck-select [placeholder]="'Select you food'">
                    <cck-option [value]="'Steak'">Steak</cck-option>
                    <cck-option [value]="'Pizza'">Pizza</cck-option>
                    <cck-option [value]="'Burger'">Burger</cck-option>
                  </cck-select>
                </cck-form-field>
              </td>
              
              <td>
                <cck-form-field class="story-w-200">
                  <cck-select [multiple]="true" [placeholder]="'Select you food'">
                    <cck-option [value]="'Steak'">Steak</cck-option>
                    <cck-option [value]="'Pizza'">Pizza</cck-option>
                    <cck-option [value]="'Burger'">Burger</cck-option>
                  </cck-select>
                </cck-form-field>
              </td>
              
              <td>
                <cck-form-field class="story-w-200" [disabled]="true">
                  <cck-select [placeholder]="'Select you food'">
                    <cck-option [value]="'Steak'">Steak</cck-option>
                    <cck-option [value]="'Pizza'">Pizza</cck-option>
                    <cck-option [value]="'Burger'">Burger</cck-option>
                  </cck-select>
                </cck-form-field>
              </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
