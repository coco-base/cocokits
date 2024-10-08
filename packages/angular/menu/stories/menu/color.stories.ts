import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src';

export const Color: AngularStoryObj<MenuComponent> = {
  name: 'Color',
  tags: ['uiComponentName:menu', 'uiComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
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
      <story-table
        [headers]="uiComponentConfig?.menu.color?.values"
        [rowHeaders]="uiComponentConfig?.menu.type?.values ?? []">
        @for (type of uiComponentConfig?.menu.type?.values ?? [null]; let row = $index; track type) {
          @for (color of uiComponentConfig?.menu.color?.values; let col = $index; track color) {
            <story-table-cell [row]="row" [col]="col">
              <cck-menu class="story-w-200" [color]="color" [type]="type">
                <cck-menu-item>Edit</cck-menu-item>
                <cck-menu-item>Duplicate</cck-menu-item>
                <cck-divider></cck-divider>
                <cck-menu-item>Archive</cck-menu-item>
                <cck-menu-item>Move</cck-menu-item>
              </cck-menu>
            </story-table-cell>
          }
        }
      </story-table>  
    `,
  }),
};
