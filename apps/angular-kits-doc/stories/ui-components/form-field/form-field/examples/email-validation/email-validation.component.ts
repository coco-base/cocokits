import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  ErrorComponent,
  FormFieldComponent,
  InputComponent,
  LabelComponent,
  SvgIconComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/email-validation.config';

@Component({
  standalone: true,
  selector: 'cck-email-validation',
  imports: [FormFieldComponent, LabelComponent, InputComponent, ErrorComponent, ReactiveFormsModule, SvgIconComponent],
  template: `
    <cck-form-field>
      <cck-label>Email</cck-label>
      <input cck-input [formControl]="emailControl" type="email" />

      <cck-error>
        <cck-svg-icon [icon]="Icons.warning"></cck-svg-icon>
        <span>Enter a valid email address</span>
      </cck-error>
    </cck-form-field>
  `,
  styles: ``,
})
export class EmailValidationComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  protected readonly Icons = Icons;
  protected emailControl = new FormControl('', [Validators.email, Validators.required]);
}
