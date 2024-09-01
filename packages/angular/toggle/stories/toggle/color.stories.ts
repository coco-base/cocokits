import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export const Color: AngularStoryObj<ToggleComponent> = {
  name: 'Color',
  tags: ['uiComponentName:toggle', 'uiComponentPropName:color'],
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
          @for (color of uiComponentConfig?.divider.color?.values; track color) {
            <th>{{color}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (color of uiComponentConfig?.divider.color?.values; track color) {
              <td>
                <cck-toggle [color]="color"></cck-toggle>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
