import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { RadioButtonComponent } from '../../src';

export const Type: AngularStoryObj<RadioButtonComponent> = {
  name: 'Type',
  tags: ['uiComponentName:radioButton', 'uiComponentPropName:type'],
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
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
          @for (type of uiComponentConfig?.radioButton.type?.values; track type) {
            <th>{{type}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (type of uiComponentConfig?.radioButton.type?.values; track type) {
              <td>
                <cck-radio-button [type]="type" [value]="1">Radio Button</cck-radio-button>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
