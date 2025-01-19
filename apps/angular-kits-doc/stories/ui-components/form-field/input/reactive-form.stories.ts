// import { FormControl, Validators } from '@angular/forms';

// import { InputComponent } from '../../src';

// export const ReactiveForm: AngularStoryObj<InputComponent> = {
//   name: 'ReactiveForm',
//   parameters: {
//     docs: {
//       description: {
//         story: `Illustrates integration within Angular's Reactive Forms, focusing on form control, validation, and efficient state management.`,
//       },
//       source: {
//         code: `
//           <cck-form-field>
//             <cck-label>FormControl</cck-label>
//             <input cckInput [formControl]="control"/>
//             @if(control.errors?.required) {
//               <cck-error>This field is required</cck-error>
//             }
//           </cck-form-field>
//         `,
//       },
//     },
//   },
//   render: (args) => ({
//     props: {
//       ...args,
//       control: new FormControl('Default Value', { validators: [Validators.required] }),
//     },
//     template: `
//       <story-columns>
//         <story-column>
//           <cck-form-field>
//             <cck-label>FormControl</cck-label>
//             <input cckInput [formControl]="control"/>
//             @if(control.errors?.required) {
//               <cck-error>This field is required</cck-error>
//             }
//           </cck-form-field>
//         </story-column>

//         <story-column>
//           <div class="p-sm-regular-3">Control Value: {{control.value}}</div>
//           <button class="story-button" (click)="control.setValue('Default')">Set Value to Default</button>
//           <button class="story-button" (click)="control.reset()">Reset</button>
//           <button class="story-button" (click)="control.disabled ? control.enable() : control.disable()">Toggle Disable</button>
//         </story-column>
//       </story-columns>
//     `,
//   }),
// };
