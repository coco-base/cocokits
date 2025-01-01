// import { AngularStoryObj } from '@cocokits/internal-model';
// import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

// import { MenuComponent } from '../../src/lib/menu/menu.component';
// import { archiveIcon, deleteIcon, duplicateIcon, editIcon, moveIcon } from '../template-svg-icon';

// export const ThemeCocokitsItemIconColor: AngularStoryObj<MenuComponent> = {
//   name: 'Theme Cocokits: With Icon/Color',
//   tags: ['theme:cocokits'],
//   parameters: {
//     docs: {
//       description: {
//         story: `Opens an overlay with menu options that feature different icons and colors, illustrating how iconography and color variations enhance the menu's visual appeal and usability.`,
//       },
//       source: {
//         code: `
//           <button class="story-button" [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '150px'}" [menuOrigin]="'bottom-left'">Open</button>

//           <ng-template #menu>
//             <cck-menu [closeOnSelectItem]="true">
//               <cck-menu-item>
//                 <cck-svg-icon [icon]="editIcon"/>
//                 Edit
//             </cck-menu-item>
//             <cck-menu-item>
//               <cck-svg-icon [icon]="duplicateIcon"/>
//                 Duplicate
//             </cck-menu-item>
//               <cck-divider></cck-divider>
//             <cck-menu-item>
//               <cck-svg-icon [icon]="archiveIcon"/>
//                 Archive
//             </cck-menu-item>
//             <cck-menu-item>
//               <cck-svg-icon [icon]="moveIcon"/>
//                 Move
//             </cck-menu-item>
//             <cck-divider></cck-divider>
//             <cck-menu-item [color]="'error'">
//               <cck-svg-icon [icon]="deleteIcon"/>
//                 Delete
//             </cck-menu-item>
//             </cck-menu>
//           </ng-template>
//         `,
//       },
//     },
//   },
//   render: (args) => ({
//     props: {
//       ...args,
//       editIcon,
//       duplicateIcon,
//       archiveIcon,
//       moveIcon,
//       deleteIcon,
//     },
//     template: `
//         <div class="story-h-350">
//           <button class="story-button" [cckMenuTrigger]="menu" [menuSizes]="{minWidth: '150px'}" [menuOrigin]="'bottom-left'">Open</button>
//         </div>

//         <ng-template #menu>
//           <cck-menu [closeOnSelectItem]="true">
//             <cck-menu-item>
//               <cck-svg-icon [icon]="editIcon"/>
//               Edit
//            </cck-menu-item>
//            <cck-menu-item>
//              <cck-svg-icon [icon]="duplicateIcon"/>
//               Duplicate
//            </cck-menu-item>
//             <cck-divider></cck-divider>
//           <cck-menu-item>
//             <cck-svg-icon [icon]="archiveIcon"/>
//               Archive
//            </cck-menu-item>
//            <cck-menu-item>
//              <cck-svg-icon [icon]="moveIcon"/>
//               Move
//            </cck-menu-item>
//            <cck-divider></cck-divider>
//            <cck-menu-item [color]="'error'">
//             <cck-svg-icon [icon]="deleteIcon"/>
//               Delete
//            </cck-menu-item>
//           </cck-menu>
//         </ng-template>
//     `,
//   }),
// };
