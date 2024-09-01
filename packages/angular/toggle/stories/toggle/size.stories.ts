import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Size: AngularStoryObj<ToggleComponent> = {
  name: 'Size',
  tags: ['uiComponentName:toggle', 'uiComponentPropName:size'],
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
          @for (size of uiComponentConfig?.divider.size?.values; track size) {
            <th>{{size}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (size of uiComponentConfig?.divider.size?.values; track size) {
              <td>
                <cck-toggle [size]="size"></cck-toggle>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
