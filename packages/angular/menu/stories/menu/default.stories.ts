import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src/lib/menu/menu.component';

export const Default: AngularStoryObj<MenuComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
      source: {
        code: `
          <button [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '150px'}" [menuOrigin]="'bottom-left'">Open</button>
          
          <ng-template #menu>
            <cck-menu [closeOnSelectItem]="true">
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
        <div class="story-h-350">
          <button class="story-button" [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '150px'}" [menuOrigin]="'bottom-left'">Open</button>
        </div>
        
        <ng-template #menu>
          <cck-menu [closeOnSelectItem]="true">
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
  }),
};
