// import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

// import { FormFieldComponent } from '../../src';
// import { copyIcon, emailIcon, infoIcon } from '../template-svg-icon';

// export const ThemeCocokitsHintError: StoryObj<FormFieldComponent> = {
//   name: 'Theme Cocokits: Hint & Error',
//   tags: ['theme:cocokits', 'theme:frames-x'],
//   parameters: {
//     docs: {
//       description: {
//         story: `Displays the formField component in states with hints and error messages, illustrating how the component visually handles guidance and validation feedback to enhance user interaction.`,
//       },
//       source: {
//         code: `
//           <cck-form-field>
//             <cck-label>Label</cck-label>
//             <input cckInput/>
//             <cck-hint>This is a hint text</cck-hint>
//           </cck-form-field>

//           <cck-form-field>
//             <cck-label>Label</cck-label>
//             <input cckInput/>
//             <cck-error [force]="true">This is an error text</cck-error>
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
//       <story-table [headers]="['Hint', 'Error']">

//         <!-- Hint -->
//         <story-table-cell row="0" col="0">
//           <cck-form-field>
//             <cck-label>Label</cck-label>
//             <input cckInput/>
//             <cck-hint>This is a hint text</cck-hint>
//           </cck-form-field>
//         </story-table-cell>

//         <!-- Error -->
//         <story-table-cell row="0" col="1">
//           <cck-form-field>
//             <cck-label>Label</cck-label>
//             <input cckInput/>
//             <cck-error [force]="true">This is an error text</cck-error>
//           </cck-form-field>
//         </story-table-cell>

//       </story-table>
//     `,
//   }),
// };
