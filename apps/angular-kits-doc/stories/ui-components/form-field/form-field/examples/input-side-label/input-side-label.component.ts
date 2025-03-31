import { Component, input } from '@angular/core';

import { FormFieldComponent, InputComponent, LabelComponent } from '@cocokits/angular-form-field';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/input-side-label.config';

@Component({
  standalone: true,
  selector: 'cck-input-side-label',
  imports: [FormFieldComponent, LabelComponent, InputComponent],
  template: `
    <cck-label for="city">City</cck-label>
    <cck-form-field>
      <input cck-input id="city" />
    </cck-form-field>

    <cck-label for="country">Country</cck-label>
    <cck-form-field>
      <input cck-input id="country" />
    </cck-form-field>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: 1fr 1fr;
      align-items: center;
      justify-items: end;
      gap: 8px 12px;
    }
  `,
})
export class InputSideLabelComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
