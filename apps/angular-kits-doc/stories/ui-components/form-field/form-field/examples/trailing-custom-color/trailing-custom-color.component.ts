import { Component, input } from '@angular/core';

import {
  FormFieldComponent,
  InputComponent,
  LabelComponent,
  SvgIconComponent,
  TrailingComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/trailing-custom-color.config';

@Component({
  standalone: true,
  selector: 'cck-trailing-custom-color',
  imports: [FormFieldComponent, InputComponent, TrailingComponent, LabelComponent, SvgIconComponent],
  template: `
    <cck-form-field>
      <cck-label>Subscribe</cck-label>
      <input cck-input [value]="'hello@cocokits.com'" />
      <cck-trailing class="custom-trailing" [clickable]="true">
        <cck-svg-icon [icon]="Icons.arrowRight" />
      </cck-trailing>
    </cck-form-field>
  `,
  styles: `
    .custom-trailing.cck-trailing {
      background-color: var(--trailing-bg);

      &:hover:not(:active) {
        background-color: var(--trailing-bg-hover);
      }

      &:active {
        background-color: var(--trailing-bg-active);
      }

      .cck-svg-icon .cck-svg-icon__svg {
        fill: var(--trailing-color);
      }
    }
  `,
})
export class TrailingCustomColorComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  public Icons = Icons;
}
