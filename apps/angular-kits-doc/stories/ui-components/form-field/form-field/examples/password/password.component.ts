import { Component, input } from '@angular/core';

import {
  FormFieldComponent,
  HintComponent,
  InputComponent,
  LabelComponent,
  SvgIconComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/input/password.config';

@Component({
  standalone: true,
  selector: 'cck-password',
  imports: [FormFieldComponent, LabelComponent, InputComponent, SvgIconComponent, HintComponent],
  template: ` <cck-form-field>
    <cck-label>Password</cck-label>
    <input cck-input type="password" placeholder="Enter your password" [required]="true" />
    <cck-hint>
      <cck-svg-icon [icon]="Icons.info" />
      <span>At least 10 characters long</span>
    </cck-hint>
  </cck-form-field>`,
  styles: ``,
})
export class PasswordComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  public readonly Icons = Icons;
}
