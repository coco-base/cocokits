// import { StoryObj } from '@cocokits/storybook-addon-theme-angular';
// import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

// export const NgModel = {
//   // export const NgModel: StoryObj<CheckboxComponent> = {
//   name: 'NgModel',
//   parameters: {
//     docs: {
//       description: {
//         story: `Demonstrates how to use Angular's NgModel for two-way data binding, enabling automatic synchronization between the UI element and the model.`,
//       },
//       source: {
//         code: `
//           <cck-checkbox [(ngModel)]="modelValue">Checkbox Label</cck-checkbox>
//         `,
//       },
//     },
//   },
//   render: (args: any) => ({
//     props: {
//       ...args,
//       modelValue: false,
//     },
//     template: `
//       <story-columns>
//         <story-column>
//           <cck-checkbox [(ngModel)]="modelValue">Checkbox Label</cck-checkbox>
//         </story-column>

//         <story-column>
//            <div class="p-sm-regular-3">NgModel Value: {{modelValue}}</div>
//           <button class="story-button" (click)="modelValue = null">Reset</button>
//           <button class="story-button" (click)="modelValue = true">Set to true</button>
//           <button class="story-button" (click)="modelValue = false">Set to false</button>
//         </story-column>
//       </story-columns>
//     `,
//   }),
// };
