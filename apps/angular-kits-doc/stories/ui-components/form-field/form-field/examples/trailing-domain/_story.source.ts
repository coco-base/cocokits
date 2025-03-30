/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'trailing-domain.component.ts',
    code: `
import { Component, input } from '@angular/core';

import { FormFieldComponent, InputComponent, LabelComponent, TrailingComponent } from '@cocokits/angular-components';


@Component({
  standalone: true,
  selector: 'cck-trailing-domain',
  imports: [FormFieldComponent, InputComponent, TrailingComponent, LabelComponent],
  template: \`
    <cck-form-field>
      <cck-label>Choose domain name</cck-label>
      <cck-trailing>.com</cck-trailing>
      <input cck-input />
    </cck-form-field>
  \`,
  styles: \`\`,
})
export class TrailingDomainComponent {

}
`,
  },
];
