import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';

export const Color: AngularStoryObj<FormFieldComponent> = {
  name: 'Color',
  tags: ['uiComponentName:formField', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `TODO: ...`,
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
          @for (color of uiComponentConfig?.formField.color?.values; track color) {
            <th>{{color}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (color of uiComponentConfig?.formField.color?.values; track color) {
              <td>
                <cck-form-field [color]="color">
                  <cck-label>Email</cck-label>
                  <input cckInput placeholder="Write your Email"/>
                </cck-form-field>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
