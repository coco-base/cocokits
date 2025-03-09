import { Component, input } from '@angular/core';

import { FormFieldComponent, InputComponent, LabelComponent, LeadingComponent } from '@cocokits/angular-components';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/leading-website.config';

@Component({
  standalone: true,
  selector: 'cck-leading-website',
  imports: [FormFieldComponent, InputComponent, LeadingComponent, LabelComponent],
  template: `
    <cck-form-field>
      <cck-label>Website URL</cck-label>
      <cck-leading>https://</cck-leading>
      <input cck-input />
    </cck-form-field>
  `,
  styles: ``,
})
export class LeadingWebsiteComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
