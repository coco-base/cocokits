import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { DividerComponent } from '../../src/lib/divider/divider.component';

export const Type: AngularStoryObj<DividerComponent> = {
  name: 'Type',
  tags: ['uiComponentName:divider', 'uiComponentPropName:type'],
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
          @for (type of uiComponentConfig?.divider.type?.values; track type) {
            <th>{{type}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (type of uiComponentConfig?.divider.type?.values; track type) {
              <td class="story-w-200 story-h-200">
                <cck-divider class="story-margin-auto" [type]="type"></cck-divider>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
