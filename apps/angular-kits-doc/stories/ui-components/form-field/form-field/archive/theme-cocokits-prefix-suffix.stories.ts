// import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

// import { FormFieldComponent } from '../../src';
// import { copyIcon, emailIcon, forkIcon, infoIcon } from '../template-svg-icon';

// export const ThemeCocokitsPrefixSuffix: StoryObj<FormFieldComponent> = {
//   name: 'Theme Cocokits: Prefix & Suffix',
//   tags: ['theme:cocokits', 'theme:frames-x'],
//   parameters: {
//     docs: {
//       description: {
//         story: `Demonstrates the formField component with prefix and suffix elements, highlighting how additional text or icons can be added before or after the input to provide context or functionality.`,
//       },
//       source: {
//         code: `
//           <cck-form-field>
//             <cck-label>Email</cck-label>
//             <cck-prefix>
//               <cck-svg-icon [icon]="...."></cck-svg-icon>
//             </cck-prefix>
//             <input cckInput placeholder="Write your Email"/>
//             <cck-suffix>
//               <cck-svg-icon [icon]="..."></cck-svg-icon>
//             </cck-suffix>
//           </cck-form-field>

//           <cck-form-field>
//             <cck-label>Select</cck-label>
//             <cck-prefix>
//               <cck-svg-icon [icon]="..."></cck-svg-icon>
//             </cck-prefix>
//             <cck-select [placeholder]="'Favorite food'">
//               <cck-option [value]="'Steak'">Steak</cck-option>
//               <cck-option [value]="'Pizza'">Pizza</cck-option>
//               <cck-option [value]="'Burger'">Burger</cck-option>
//             </cck-select>
//           </cck-form-field>
//         `,
//       },
//     },
//   },
//   render: (args) => ({
//     props: {
//       ...args,
//       emailIcon,
//       infoIcon,
//       copyIcon,
//       forkIcon,
//     },
//     template: `
//       <story-table
//         [rowHeaders]="['Select', 'Prefix', 'Suffix', 'Both', 'Disabled', 'ChipList']"
//         cellHAlign="start">

//         <!-- Select -->
//         <story-table-cell row="0">
//           <cck-form-field class="story-w-300">
//             <cck-label>Select</cck-label>
//             <cck-prefix>
//               <cck-svg-icon [icon]="forkIcon"></cck-svg-icon>
//             </cck-prefix>
//             <cck-select [placeholder]="'Favorite food'">
//               <cck-option [value]="'Steak'">Steak</cck-option>
//               <cck-option [value]="'Pizza'">Pizza</cck-option>
//               <cck-option [value]="'Burger'">Burger</cck-option>
//             </cck-select>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- Prefix -->
//         <story-table-cell row="1">
//           <cck-form-field class="story-w-300">
//             <cck-label>Email</cck-label>
//             <input cckInput placeholder="Write your Email"/>
//             <cck-prefix>
//               <cck-svg-icon [icon]="emailIcon"></cck-svg-icon>
//             </cck-prefix>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- Suffix -->
//         <story-table-cell row="2">
//           <cck-form-field class="story-w-300">
//             <cck-label>Email</cck-label>
//             <input cckInput placeholder="Write your Email"/>
//             <cck-suffix>
//               <cck-svg-icon [icon]="infoIcon"></cck-svg-icon>
//             </cck-suffix>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- Both -->
//         <story-table-cell row="3">
//           <cck-form-field class="story-w-300">
//             <cck-label>Email</cck-label>
//             <cck-prefix>
//               <cck-svg-icon [icon]="emailIcon"></cck-svg-icon>
//             </cck-prefix>
//             <input cckInput placeholder="Write your Email"/>
//             <cck-suffix>
//               <cck-svg-icon [icon]="infoIcon"></cck-svg-icon>
//             </cck-suffix>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- Disabled -->
//         <story-table-cell row="4">
//           <cck-form-field class="story-w-300" [disabled]="true">
//             <cck-label>Email</cck-label>
//             <cck-prefix>
//               <cck-svg-icon [icon]="emailIcon"></cck-svg-icon>
//             </cck-prefix>
//             <input cckInput placeholder="Write your Email"/>
//             <cck-suffix>
//               <cck-svg-icon [icon]="infoIcon"></cck-svg-icon>
//             </cck-suffix>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- ChipList -->
//         <story-table-cell row="5">
//           <cck-form-field class="story-w-600">
//             <cck-label>Foods</cck-label>
//             <cck-prefix>
//               <cck-svg-icon [icon]="forkIcon"></cck-svg-icon>
//             </cck-prefix>
//             <cck-chip-list [chips]="['Steak', 'Pizza', 'Burger']" [placeholder]="'Add a new food'" [addOnBlur]="true"/>
//             <cck-suffix>
//               <cck-svg-icon [icon]="infoIcon"></cck-svg-icon>
//             </cck-suffix>
//           </cck-form-field>
//         </story-table-cell>

//       </story-table>
//   `,
//   }),
// };
