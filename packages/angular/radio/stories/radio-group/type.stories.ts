import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Type: AngularStoryObj<RadioButtonComponent> = {
  name: 'Type',
  tags: ['uiComponentName:radioGroup', 'uiComponentPropName:type'],
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
          @for (type of uiComponentConfig?.radioGroup.type?.values; track type) {
            <th>{{type}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (type of uiComponentConfig?.radioGroup.type?.values; track type) {
              <td>
                <cck-radio-group [type]="type" [selected]="1">
                  <cck-radio-button [value]="1">Radio Button 1</cck-radio-button>
                  <cck-radio-button [value]="2">Radio Button 2</cck-radio-button>
                </cck-radio-group>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
