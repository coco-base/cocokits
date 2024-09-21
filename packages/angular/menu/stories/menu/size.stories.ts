import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src';

export const Size: AngularStoryObj<MenuComponent> = {
  name: 'Size',
  tags: ['uiComponentName:menu', 'uiComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
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
          @for (size of uiComponentConfig?.menu.size?.values; track size) {
            <th>{{size}}</th>
          }
        </thead>
        <tbody>
          <tr>
            @for (size of uiComponentConfig?.menu.size?.values; track size) {
              <td>
                <cck-menu class="story-w-200" [size]="size">
                  <cck-menu-item>Edit</cck-menu-item>
                  <cck-menu-item>Duplicate</cck-menu-item>
                  <cck-divider></cck-divider>
                  <cck-menu-item>Archive</cck-menu-item>
                  <cck-menu-item>Move</cck-menu-item>
                </cck-menu>
              </td>
            }
          </tr>
         
        </tbody>
      </table>
    `,
  }),
};
