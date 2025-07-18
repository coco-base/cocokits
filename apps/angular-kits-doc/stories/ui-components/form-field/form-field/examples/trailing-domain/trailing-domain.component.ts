import { Component, input } from '@angular/core';

import { FormFieldComponent, InputComponent, LabelComponent, TrailingComponent } from '@cocokits/angular-components';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/trailing-domain.config';

@Component({
  selector: 'cck-trailing-domain',
  imports: [FormFieldComponent, InputComponent, TrailingComponent, LabelComponent],
  template: `
    <cck-form-field>
      <cck-label>Choose domain name</cck-label>
      <cck-trailing>.com</cck-trailing>
      <input cck-input />
    </cck-form-field>
  `,
  styles: ``,
})
export class TrailingDomainComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
