// import { FormControl } from '@angular/forms';

// import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

// import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

// export const ReactiveForm = {
//   // export const ReactiveForm: StoryObj<CheckboxComponent> = {
//   name: 'ReactiveForm',
//   parameters: {
//     docs: {
//       description: {
//         story: `Illustrates integration within Angular's Reactive Forms, focusing on form control, validation, and efficient state management.`,
//       },
//       source: {
//         code: `
//           <cck-checkbox [formControl]="control">Checkbox Label</cck-checkbox>
//         `,
//       },
//     },
//   },
//   render: (args: any) => ({
//     props: {
//       ...args,
//       control: new FormControl(false),
//     },
//     template: `
//       <story-columns>
//         <story-column>
//           <cck-checkbox [formControl]="control">Checkbox Label</cck-checkbox>
//         </story-column>

//         <story-column>
//           <div class="p-sm-regular-3">Control Value: {{control.value}}</div>
//           <button class="story-button" (click)="control.reset()">Reset</button>
//           <button class="story-button" (click)="control.setValue(true)">Set to true</button>
//           <button class="story-button" (click)="control.setValue(false)">Set to false</button>
//           <button class="story-button" (click)="control.disabled ? control.enable() : control.disable()">Toggle Disable</button>
//         </story-column>
//       </story-columns>
//     `,
//   }),
// };
