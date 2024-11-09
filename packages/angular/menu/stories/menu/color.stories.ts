import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src';

export const Color: AngularStoryObj<MenuComponent> = {
  name: 'Color',
  tags: ['uiBaseComponentName:menu', 'uiBaseComponentPropName:color'],
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
      source: {
        code: `
          <button [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '150px'}" [menuOrigin]="'bottom-left'">Open</button>
          
          <ng-template #menu>
            <cck-menu [closeOnSelectItem]="true" [color]="...">
              <cck-menu-item>Edit</cck-menu-item>
              <cck-menu-item>Duplicate</cck-menu-item>
              <cck-divider></cck-divider>
              <cck-menu-item>Archive</cck-menu-item>
              <cck-menu-item disabled>Move</cck-menu-item>
              <cck-divider></cck-divider>
              <cck-menu-item>Share</cck-menu-item>
              <cck-menu-item>Add to favorite</cck-menu-item>
            </cck-menu>
          </ng-template>
        `,
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      themeComponentConfig: getSelectedCckTheme()?.themeConfig.components,
    },
    template: `
      <story-table
        [headers]="themeComponentConfig?.menu.color?.values"
        [rowHeaders]="themeComponentConfig?.menu.type?.values ?? []">
        @for (type of themeComponentConfig?.menu.type?.values ?? [null]; let row = $index; track type) {
          @for (color of themeComponentConfig?.menu.color?.values; let col = $index; track color) {
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
