// import { AngularStoryObj } from '@cocokits/internal-model';
// import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

// import { SelectComponent } from '../../src';

// export const NgModel: AngularStoryObj<SelectComponent> = {
//   name: 'NgModel',
//   parameters: {
//     docs: {
//       description: {
//         story: `Demonstrates how to use Angular's NgModel for two-way data binding, enabling automatic synchronization between the UI element and the model.`,
//       },
//       source: {
//         code: `
//           <cck-form-field>
//             <cck-label>NgModel</cck-label>
//             <cck-select [(ngModel)]="modelValue" [placeholder]="'Favorite food'">
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
//       modelValue: 'Default Value',
//     },
//     template: `
//       <story-columns>
//         <story-column>
//           <cck-form-field class="story-w-200">
//             <cck-label>NgModel</cck-label>
//             <cck-select [(ngModel)]="modelValue" [placeholder]="'Favorite food'">
//               <cck-option [value]="'Steak'">Steak</cck-option>
//               <cck-option [value]="'Pizza'">Pizza</cck-option>
//               <cck-option [value]="'Burger'">Burger</cck-option>
//             </cck-select>
//           </cck-form-field>
//         </story-column>

//         <story-column>
//           <div class="p-sm-regular-3">NgModel Value: {{modelValue}}</div>
//           <input class="story-input" [(ngModel)]="modelValue"/>
//         </story-column>
//       </story-columns>
//     `,
//   }),
// };
