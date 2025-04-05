/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Mon Mar 24 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'checkbox-label-through.component.ts',
    code: `
import { Component, Input } from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-checkbox';


@Component({
  standalone: true,
  selector: 'cck-checkbox-label-through',
  imports: [CheckboxComponent],
  template: \`
    <cck-checkbox 
      [size]="'<%=size%>'" 
      [value]="1" 
      (change)="checked = $event.checked"
    >
      <span [class.striked-label]="checked"> Checkbox Label </span>
    </cck-checkbox>
  \`,
  styles: [
    \`
      .striked-label {
        text-decoration: line-through;
      }
    \`,
  ],
})
export class CheckboxLabelThroughComponent {
  @Input() cckExampleArgs!: ExampleArgs;
  checked = false;
}
`,
  },
];
