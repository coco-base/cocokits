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
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/input-link.config';

@Component({
  standalone: true,
  selector: 'cck-input-link',
  imports: [FormFieldComponent, LabelComponent, HintComponent, InputComponent, PrefixComponent, SvgIconComponent],
  template: `
    <cck-form-field>
      <cck-label>Link</cck-label>
      <input cck-input placeholder="Example.com" />
      <cck-prefix>
        <cck-svg-icon [icon]="Icons.link"></cck-svg-icon>
      </cck-prefix>
      <cck-hint>Enter a valid link to your website</cck-hint>
    </cck-form-field>
  `,
  styles: ``,
})
export class InputLinkComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  protected readonly Icons = Icons;
}
