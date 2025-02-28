import { Component, input } from '@angular/core';

import {
  FormFieldComponent,
  InputComponent,
  LabelComponent,
  LeadingComponent,
  SvgIconComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/leading-icon.config';

@Component({
  standalone: true,
  selector: 'cck-leading-icon',
  imports: [FormFieldComponent, InputComponent, LeadingComponent, LabelComponent, SvgIconComponent],
  template: `
    <cck-form-field>
      <cck-label>Enter username</cck-label>
      <cck-leading>
        <cck-svg-icon [icon]="Icons.user"></cck-svg-icon>
      </cck-leading>
      <input cck-input />
    </cck-form-field>
  `,
  styles: ``,
})
export class LeadingIconComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  protected readonly Icons = Icons;
}
