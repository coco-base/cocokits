import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src';

export const Type: AngularStoryObj<MenuComponent> = {
  name: 'Type',
  tags: ['uiComponentName:menu', 'uiComponentPropName:type'],
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique button styles.',
      },
      source: {
        code: `
          <button [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '150px'}" [menuOrigin]="'bottom-left'">Open</button>
          
          <ng-template #menu>
            <cck-menu [closeOnSelectItem]="true" [type]="...">
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
      uiComponentConfig: getSelectedCckTheme()?.uiComponentConfig,
    },
    template: `
      <story-table
        [headers]="uiComponentConfig?.menu.type?.values">
        @for (type of uiComponentConfig?.menu.type?.values; let i = $index; track type) {
          <story-table-cell row="0" [col]="i">
            <cck-menu class="story-w-200" [type]="type">
              <cck-menu-item>Edit</cck-menu-item>
              <cck-menu-item>Duplicate</cck-menu-item>
              <cck-divider></cck-divider>
              <cck-menu-item>Archive</cck-menu-item>
              <cck-menu-item>Move</cck-menu-item>
            </cck-menu>
          </story-table-cell>
        }
      </story-table>
    `,
  }),
};
