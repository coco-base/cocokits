import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Type: AngularStoryObj<ToggleComponent> = {
  name: 'Type',
  tags: ['uiComponentName:toggle', 'uiComponentPropName:type'],
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
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
          @for (type of uiComponentConfig?.toggle.type?.values; track type) {
            <th>{{type}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (type of uiComponentConfig?.toggle.type?.values; track type) {
              <td>
                <cck-toggle [type]="type"></cck-toggle>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
