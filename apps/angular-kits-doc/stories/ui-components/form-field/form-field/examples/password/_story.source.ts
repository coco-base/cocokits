// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Wed Mar 05 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'password.component.ts',
    code: `
import { Component, input } from '@angular/core';

import {
  FormFieldComponent,
  HintComponent,
  InputComponent,
  LabelComponent,
  SvgIconComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';


@Component({
  standalone: true,
  selector: 'cck-password',
  imports: [FormFieldComponent, LabelComponent, InputComponent, SvgIconComponent, HintComponent],
  template: \` <cck-form-field>
    <cck-label>Password</cck-label>
    <input cck-input type="password" placeholder="Enter your password" [required]="true" />
    <cck-hint>
      <cck-svg-icon [icon]="Icons.info" />
      <span>At least 10 characters long</span>
    </cck-hint>
  </cck-form-field>\`,
  styles: \`\`,
})
export class PasswordComponent {

  public readonly Icons = Icons;
}
`,
  },
];
