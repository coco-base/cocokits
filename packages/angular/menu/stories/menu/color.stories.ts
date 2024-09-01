import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src';

export const Color: AngularStoryObj<MenuComponent> = {
  name: 'Color',
  tags: ['uiComponentName:menu', 'uiComponentPropName:color'],
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
          @for (color of uiComponentConfig?.color.color?.values; track color) {
            <th>{{color}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (color of uiComponentConfig?.color.color?.values; track color) {
              <td>
                <cck-menu [color]="color"></cck-menu>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};