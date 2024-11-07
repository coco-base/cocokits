import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src';

export const Size: AngularStoryObj<MenuComponent> = {
  name: 'Size',
  tags: ['uiBaseComponentName:menu', 'uiBaseComponentPropName:size'],
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
      source: {
        code: `
          <button [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '150px'}" [menuOrigin]="'bottom-left'">Open</button>
          
          <ng-template #menu>
            <cck-menu [closeOnSelectItem]="true" [size]="...">
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
      themeConfig: getSelectedCckTheme()?.themeConfig,
    },
    template: ` 
      <story-table
        [headers]="themeConfig?.menu.size?.values"
        [rowHeaders]="themeConfig?.menu.type?.values ?? []">
        @for (type of themeConfig?.menu.type?.values ?? [null]; let row = $index; track type) {
          @for (size of themeConfig?.menu.size?.values; let col = $index; track size) {
            <story-table-cell [row]="row" [col]="col">
              <cck-menu class="story-w-200" [size]="size" [type]="type">
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
