// import { AngularStoryObj } from '@cocokits/internal-model';
// import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

// import { ToggleComponent } from '../../src';

// export const NgModel: AngularStoryObj<ToggleComponent> = {
//   name: 'NgModel',
//   parameters: {
//     docs: {
//       description: {
//         story: `Demonstrates how to use Angular's NgModel for two-way data binding, enabling automatic synchronization between the UI element and the model.`,
//       },
//       source: {
//         code: `
//           <cck-toggle [(ngModel)]="modelValue">Slide me!</cck-toggle>
//         `,
//       },
//     },
//   },
//   render: (args) => ({
//     props: {
//       ...args,
//       modelValue: true,
//     },
//     template: `
//       <story-columns>
//         <story-column>
//           <cck-toggle [(ngModel)]="modelValue"></cck-toggle>
//         </story-column>

//         <story-column>
//           <div class="p-sm-regular-3">NgModel Value: {{modelValue}}</div>
//           <button class="story-button" (click)="modelValue = false">Set To False</button>
//           <button class="story-button" (click)="modelValue = true">Set To True</button>
//         </story-column>
//       </story-columns>
//     `,
//   }),
// };
