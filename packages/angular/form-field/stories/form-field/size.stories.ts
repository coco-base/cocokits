import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { FormFieldComponent } from '../../src';

export const Size: AngularStoryObj<FormFieldComponent> = {
  name: 'Size',
  tags: ['uiComponentName:formField', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story: 'TODO: Add story description',
      },
      source: {
        code: `TODO:...`,
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
                <cck-form-field [size]="size">
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
