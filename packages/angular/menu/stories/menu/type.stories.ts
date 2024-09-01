import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src';

export const Type: AngularStoryObj<MenuComponent> = {
  name: 'Type',
  tags: ['uiComponentName:menu', 'uiComponentPropName:type'],
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
          @for (type of uiComponentConfig?.menu.type?.values; track type) {
            <th>{{type}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (type of uiComponentConfig?.menu.type?.values; track type) {
              <td>
                <cck-menu [type]="type"></cck-menu>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};