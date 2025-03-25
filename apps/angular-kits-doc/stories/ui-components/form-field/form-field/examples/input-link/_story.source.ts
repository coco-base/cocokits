/* eslint-disable @typescript-eslint/no-unused-vars */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Tue Mar 25 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'input-link.component.ts',
    code: `
import { Component, input } from '@angular/core';

import {
  FormFieldComponent,
  HintComponent,
  InputComponent,
  LabelComponent,
  PrefixComponent,
  SvgIconComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';


@Component({
  standalone: true,
  selector: 'cck-input-link',
  imports: [FormFieldComponent, LabelComponent, HintComponent, InputComponent, PrefixComponent, SvgIconComponent],
  template: \`
    <cck-form-field>
      <cck-label>Link</cck-label>
      <input cck-input placeholder="Example.com" />
      <cck-prefix>
        <cck-svg-icon [icon]="Icons.link"></cck-svg-icon>
      </cck-prefix>
      <cck-hint>Enter a valid link to your website</cck-hint>
    </cck-form-field>
  \`,
  styles: \`\`,
})
export class InputLinkComponent {

  protected readonly Icons = Icons;
}
`,
  },
];
