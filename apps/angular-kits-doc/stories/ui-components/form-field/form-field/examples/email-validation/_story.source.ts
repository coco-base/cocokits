/* eslint-disable @typescript-eslint/no-unused-vars */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Tue Mar 25 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'email-validation.component.ts',
    code: `
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


@Component({
  standalone: true,
  selector: 'cck-email-validation',
  imports: [FormFieldComponent, LabelComponent, InputComponent, ErrorComponent, ReactiveFormsModule, SvgIconComponent],
  template: \`
    <cck-form-field>
      <cck-label>Email</cck-label>
      <input cck-input [formControl]="emailControl" type="email" />

      <cck-error>
        <cck-svg-icon [icon]="Icons.warning"></cck-svg-icon>
        <span>Enter a valid email address</span>
      </cck-error>
    </cck-form-field>
  \`,
  styles: \`\`,
})
export class EmailValidationComponent {

  protected readonly Icons = Icons;
  protected emailControl = new FormControl('', [Validators.email, Validators.required]);
}
`,
  },
];
