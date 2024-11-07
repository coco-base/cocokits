import { OverlayConnectElemOrigin } from '@cocokits/angular-overlay';
import { AngularStoryObj } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { MenuComponent } from '../../src/lib/menu/menu.component';

export const Origin: AngularStoryObj<MenuComponent> = {
  name: 'Origin',
  parameters: {
    docs: {
      description: {
        story: `Explores how the menu overlay's position can be adjusted relative to the target element, demonstrating how different origin points like top-left affect where the menu appears upon activation.`,
      },
      source: {
        code: `
          
          <button [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '200px'}" [menuOrigin]="Origin.BottomLeft">BottomLeft - Left</button>
          <button [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '200px'}" [menuOrigin]="Origin.BottomRight">Bottom - Right</button>
          <button [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '200px'}" [menuOrigin]="Origin.TopLeft">Top - Left</button>
          <button [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '200px'}" [menuOrigin]="Origin.TopRight">Top - Right</button>

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
      Origin: OverlayConnectElemOrigin,
    },
    template: `
       <div class="story-h-600 w-100 flex-col justify-center align-center gap-16">
        <button class="story-button" [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '200px'}" [menuOrigin]="Origin.BottomLeft">BottomLeft - Left</button>
        <button class="story-button" [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '200px'}" [menuOrigin]="Origin.BottomRight">Bottom - Right</button>
        <button class="story-button" [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '200px'}" [menuOrigin]="Origin.TopLeft">Top - Left</button>
        <button class="story-button" [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '200px'}" [menuOrigin]="Origin.TopRight">Top - Right</button>
       </div>
        
        <ng-template #menu>
          <cck-menu>
            <cck-menu-item>Edit</cck-menu-item>
            <cck-menu-item>Duplicate</cck-menu-item>
            <cck-divider></cck-divider>
            <cck-menu-item>Archive</cck-menu-item>
            <cck-menu-item>Move</cck-menu-item>
            <cck-divider></cck-divider>
            <cck-menu-item>Share</cck-menu-item>
            <cck-menu-item>Add to favorite</cck-menu-item>
          </cck-menu>
        </ng-template>
    `,
  }),
};
