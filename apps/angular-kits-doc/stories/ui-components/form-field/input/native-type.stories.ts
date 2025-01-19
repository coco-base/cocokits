// import { FormFieldComponent } from '../../src';

// export const NativeType: AngularStoryObj<FormFieldComponent> = {
//   name: 'NativeType',
//   tags: ['uiBaseComponentName:formField'],
//   parameters: {
//     docs: {
//       description: {
//         story: `Illustrates the component's support for various native HTML input types, highlighting how each type behaves and integrates within the user interface.`,
//       },
//       source: {
//         code: `
//           <cck-form-field>
//             <input cckInput [type]="..."/>
//           </cck-form-field>
//         `,
//       },
//     },
//   },
//   render: (args) => ({
//     props: {
//       ...args,
//       types: [
//         'color',
//         'date',
//         'datetime-local',
//         'email',
//         'month',
//         'number',
//         'password',
//         'search',
//         'tel',
//         'text',
//         'time',
//         'url',
//         'week',
//       ],
//     },
//     template: `
//       <story-table
//         [rowHeaders]="types"
//         cellHAlign="start">
//         @for (type of types; let i = $index; track type) {
//           <story-table-cell [row]="i">
//             <cck-form-field class="story-w-200">
//               <input cckInput [type]="type"/>
//             </cck-form-field>
//           </story-table-cell>
//         }
//       </story-table>
//     `,
//   }),
// };
