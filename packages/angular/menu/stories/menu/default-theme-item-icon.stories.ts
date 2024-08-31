import { AngularStoryObj } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src/lib/menu/menu.component';
import { archiveIcon, deleteIcon, duplicateIcon, editIcon, moveIcon } from '../template-svg-icon';

export const ItemIconColor: AngularStoryObj<MenuComponent> = {
  name: 'Theme Default: With Icon/Color',
  tags: ['theme:default'],
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
      editIcon,
      duplicateIcon,
      archiveIcon,
      moveIcon,
      deleteIcon,
    },
    template: `
        <div class="story-h-350">
          <button class="story-button" [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '150px'}" [menuOrigin]="'bottom-left'">Open</button>
        </div>
        
        <ng-template #menu>
          <cck-menu [closeOnSelectItem]="true">
            <cck-menu-item>
              <cck-svg-icon [icon]="editIcon"/>
              Edit
           </cck-menu-item>
           <cck-menu-item>
             <cck-svg-icon [icon]="duplicateIcon"/>
              Duplicate
           </cck-menu-item>
            <cck-divider></cck-divider>
          <cck-menu-item>
            <cck-svg-icon [icon]="archiveIcon"/>
              Archive
           </cck-menu-item>
           <cck-menu-item>
             <cck-svg-icon [icon]="moveIcon"/>
              Move
           </cck-menu-item>
           <cck-divider></cck-divider>
           <cck-menu-item [color]="'error'">
            <cck-svg-icon [icon]="deleteIcon"/>
              Delete
           </cck-menu-item>
          </cck-menu>
        </ng-template>
    `,
  }),
};
