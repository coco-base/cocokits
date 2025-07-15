import { Component, input } from '@angular/core';

import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import {
  FormFieldComponent,
  InputComponent,
  LabelComponent,
  SuffixComponent,
  SvgIconComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/suffix-card-pattern.config';

@Component({
  selector: 'cck-suffix-card-pattern',
  imports: [FormFieldComponent, LabelComponent, InputComponent, SuffixComponent, SvgIconComponent, NgxMaskDirective],
  providers: [provideNgxMask()],
  template: `
    <cck-form-field>
      <cck-label>Card information</cck-label>
      <input cckInput mask="9999 9999 9999 9999" />
      <cck-suffix>
        <cck-svg-icon [icon]="Icons.card"></cck-svg-icon>
      </cck-suffix>
    </cck-form-field>
  `,
  styles: ``,
})
export class SuffixCardPatternComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  protected Icons = Icons;
}
