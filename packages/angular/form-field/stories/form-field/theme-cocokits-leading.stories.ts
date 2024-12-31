// import { AngularStoryObj } from '@cocokits/internal-model';
// import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

// import { FormFieldComponent } from '../../src';
// import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

// export const ThemeCocokitsLeading: AngularStoryObj<FormFieldComponent> = {
//   name: 'Theme Cocokits: Leading',
//   tags: ['theme:cocokits'],
//   parameters: {
//     docs: {
//       description: {
//         story: `Shows the formField component with a leading element, demonstrating how icons or labels can be integrated at the start to enhance functionality and user interaction.`,
//       },
//       source: {
//         code: `

//           <cck-form-field>
//             <cck-label>Url</cck-label>
//             <cck-leading>https://</cck-leading>
//             <input cckInput placeholder="google.com"/>
//           </cck-form-field>

//           <cck-form-field>
//             <cck-label>Phone</cck-label>
//             <cck-leading>
//               <cck-select [value]="'US'">
//                 <cck-option [value]="'AT'">AT</cck-option>
//                 <cck-option [value]="'IR'">IR</cck-option>
//                 <cck-option [value]="'US'">US</cck-option>
//               </cck-select>
//             </cck-leading>
//             <input cckInput placeholder="+1 (555) 000-0000"/>
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
//     },
//     template: `
//       <story-table
//         [rowHeaders]="['Select', 'Regular', 'Medium', 'Grey', 'Clickable', 'Disabled']"
//         cellHAlign="start">

//         <!-- Select -->
//         <story-table-cell row="0">
//           <cck-form-field>
//             <cck-label>Phone</cck-label>
//             <cck-leading [type]="'medium'" [color]="'grey'">
//               <cck-select [size]="'sm'" [value]="'US'" style="width: 45px">
//                 <cck-option [value]="'AT'">AT</cck-option>
//                 <cck-option [value]="'IR'">IR</cck-option>
//                 <cck-option [value]="'US'">US</cck-option>
//               </cck-select>
//             </cck-leading>
//             <input cckInput placeholder="+1 (555) 000-0000"/>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- Regular -->
//         <story-table-cell row="1">
//           <cck-form-field>
//             <cck-label>Url</cck-label>
//             <cck-leading [type]="'regular'">https://</cck-leading>
//             <input cckInput placeholder="google.com"/>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- Medium -->
//         <story-table-cell row="2">
//           <cck-form-field>
//             <cck-label>Url</cck-label>
//             <cck-leading [type]="'medium'">https://</cck-leading>
//             <input cckInput placeholder="google.com"/>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- Grey -->
//         <story-table-cell row="3">
//           <cck-form-field>
//             <cck-label>Url</cck-label>
//             <cck-leading [color]="'grey'">https://</cck-leading>
//             <input cckInput placeholder="google.com"/>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- Clickable -->
//         <story-table-cell row="4">
//           <cck-form-field>
//             <cck-label>Url</cck-label>
//             <cck-leading [clickable]="true">https://</cck-leading>
//             <input cckInput placeholder="google.com"/>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- Disabled -->
//         <story-table-cell row="5">
//           <cck-form-field [disabled]="true">
//             <cck-label>Url</cck-label>
//             <cck-leading>https://</cck-leading>
//             <input cckInput placeholder="google.com"/>
//           </cck-form-field>
//         </story-table-cell>

//       </story-table>
//     `,
//   }),
// };
