import { Component, input } from '@angular/core';

import {
  FormFieldComponent,
  InputComponent,
  PrefixComponent,
  SuffixComponent,
  SvgIconComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/prefix-suffix-search.config';

@Component({
  selector: 'cck-prefix-suffix-search',
  imports: [FormFieldComponent, InputComponent, PrefixComponent, SuffixComponent, SvgIconComponent],
  template: `
    <cck-form-field>
      <input cck-input placeholder="Search ..." />
      <cck-prefix>
        <cck-svg-icon [size]="cckExampleArgs().iconSize" [icon]="Icons.search"></cck-svg-icon>
      </cck-prefix>
      <cck-suffix>
        <cck-svg-icon [size]="cckExampleArgs().iconSize" [icon]="Icons.mic"></cck-svg-icon>
      </cck-suffix>
    </cck-form-field>
  `,
  styles: ``,
})
export class PrefixSuffixSearchComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  protected readonly Icons = Icons;
}
