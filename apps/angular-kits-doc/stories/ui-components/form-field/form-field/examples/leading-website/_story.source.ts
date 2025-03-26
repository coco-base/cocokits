/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'leading-website.component.ts',
    code: `
import { Component, input } from '@angular/core';

import { FormFieldComponent, InputComponent, LabelComponent, LeadingComponent } from '@cocokits/angular-components';


@Component({
  standalone: true,
  selector: 'cck-leading-website',
  imports: [FormFieldComponent, InputComponent, LeadingComponent, LabelComponent],
  template: \`
    <cck-form-field>
      <cck-label>Website URL</cck-label>
      <cck-leading>https://</cck-leading>
      <input cck-input />
    </cck-form-field>
  \`,
  styles: \`\`,
})
export class LeadingWebsiteComponent {

}
`,
  },
];
